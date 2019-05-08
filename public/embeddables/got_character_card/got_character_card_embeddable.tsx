/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  Embeddable,
  EmbeddableInput,
  triggerRegistry,
  Container,
  EmbeddableOutput,
} from 'plugins/embeddable_api/index';
import React from 'react';
import ReactDom from 'react-dom';
import { Subscription } from 'rxjs';
import { SEND_MESSAGE_ACTION } from 'plugins/embeddable_api/__test__';
import { GOT_CHARACTER_CARD_EMBEDDABLE } from './got_character_card_embeddable_factory';
import { GotCharacterCardEmbeddableComponent } from './got_character_card';
import { WAR_COUNCIL_ACTION } from '../../actions/war_council_action';
import { RELOCATE_ACTION } from '../../actions/relocate_action';

export interface GotCharacterCardEmbeddableInput extends EmbeddableInput {
  firstName: string;
  lastName: string;
  nameTitle?: string;
  isAlive: boolean;
  mood: string;
  location: string;
}

export interface GotCharacterCardEmbeddableOutput extends EmbeddableOutput {
  fullName: string;
  sigilImageUrl: string;
  originalLastName: string;
}

function getFullName(input: GotCharacterCardEmbeddableInput) {
  const { nameTitle, firstName, lastName } = input;
  const nameParts = [nameTitle, firstName, lastName].filter(name => name !== undefined);
  return nameParts.join(' ');
}

function getSigilImageUrl(lastName: string) {
  switch (lastName) {
    case 'Stark':
    case 'Snow':
      return 'https://source.unsplash.com/uDpDycSH2r4/400x100';
    case 'Lannister':
      return 'https://source.unsplash.com/lbuXprjhtc4/400x100';
    case 'Targaryen':
      return 'https://source.unsplash.com/MYjFOiVWWT8/400x100';
    case 'Baratheon':
      return 'https://source.unsplash.com/KhyOccNSSrg/400x100';
    default:
      return 'https://source.unsplash.com/400x100/?Animal';
  }
}

export class GotCharacterCardEmbeddable extends Embeddable<
  GotCharacterCardEmbeddableInput,
  GotCharacterCardEmbeddableOutput
> {
  private subscription: Subscription;
  private node?: Element;
  public readonly type = GOT_CHARACTER_CARD_EMBEDDABLE;

  constructor(initialInput: GotCharacterCardEmbeddableInput, parent?: Container) {
    super(
      initialInput,
      {
        fullName: getFullName(initialInput),
        originalLastName: initialInput.lastName,
        sigilImageUrl: getSigilImageUrl(initialInput.lastName),
      },
      parent
    );

    this.subscription = this.getInput$().subscribe(() => {
      const fullName = getFullName(this.input);
      this.updateOutput({
        fullName,
        sigilImageUrl: getSigilImageUrl(this.input.lastName),
        title: `Hello ${fullName}`,
      });
    });
  }

  public render(node: HTMLElement) {
    this.node = node;
    ReactDom.render(<GotCharacterCardEmbeddableComponent embeddable={this} />, node);
  }

  public destroy() {
    super.destroy();
    this.subscription.unsubscribe();
    if (this.node) {
      ReactDom.unmountComponentAtNode(this.node);
    }
  }

  public reload() {}
}

export const CONTACT_CHARACTER_TRIGGER = 'CONTACT_CHARACTER_TRIGGER';

triggerRegistry.registerTrigger({
  id: CONTACT_CHARACTER_TRIGGER,
  actionIds: [SEND_MESSAGE_ACTION],
});

export const CHANGE_LOCATION_TRIGGER = 'CHANGE_LOCATION_TRIGGER';
triggerRegistry.registerTrigger({
  id: CHANGE_LOCATION_TRIGGER,
  actionIds: [WAR_COUNCIL_ACTION, RELOCATE_ACTION],
});
