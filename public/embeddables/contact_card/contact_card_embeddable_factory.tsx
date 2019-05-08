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

import React from 'react';
import { embeddableFactories, EmbeddableFactory } from 'plugins/embeddable_api/index';
import { Container } from 'plugins/embeddable_api/containers';
import { i18n } from '@kbn/i18n';
import { getNewPlatform } from 'ui/new_platform';
import { ContactCardEmbeddable, ContactCardEmbeddableInput } from './contact_card_embeddable';
import { ContactCardInitializer } from './contact_card_initializer';
import { Location } from './contact_card';

export const CONTACT_CARD_EMBEDDABLE = 'CONTACT_CARD_EMBEDDABLE';

function randomlyChoose<T>(options: T[]): T {
  const index = Math.floor(Math.random() * options.length);
  return options[index];
}

export class ContactCardEmbeddableFactory extends EmbeddableFactory<ContactCardEmbeddableInput> {
  constructor() {
    super({
      name: CONTACT_CARD_EMBEDDABLE,
    });
  }

  public isEditable() {
    return true;
  }

  public getDefaultLocation(lastName?: string) {
    switch (lastName) {
      case 'Stark':
        return Location.WINTERFELL;
      case 'Targaryen':
        return Location.KINGS_LANDING;
      case 'Lannister':
        return Location.KINGS_LANDING;
      default:
        return randomlyChoose([
          Location.BEYOND_THE_WALL,
          Location.KINGS_LANDING,
          Location.WINTERFELL,
        ]);
    }
  }

  public getDefaultMood(lastName?: string) {
    switch (lastName) {
      case 'Stark':
        return 'cold';
      case 'Targaryen':
        return 'hot';
      case 'Lannister':
        return 'rich';
      default:
        return randomlyChoose(['bored', 'happy', 'sad', 'vengeful']);
    }
  }

  public getDefaultInput(partial: Partial<ContactCardEmbeddableInput>) {
    return {
      isAlive: true,
      mood: this.getDefaultMood(partial.lastName),
      location: this.getDefaultLocation(partial.lastName),
    };
  }

  public getDisplayName() {
    return i18n.translate('kbn.embeddable.samples.contactCard.displayName', {
      defaultMessage: 'contact card',
    });
  }

  public getExplicitInput(): Promise<Partial<ContactCardEmbeddableInput>> {
    return new Promise(resolve => {
      const modalSession = getNewPlatform().start.core.overlays.openModal(
        <ContactCardInitializer
          onCancel={() => {
            modalSession.close();
            resolve(undefined);
          }}
          onCreate={(input: { firstName: string; lastName: string }) => {
            modalSession.close();
            resolve(input);
          }}
        />,
        {
          'data-test-subj': 'createContactCardEmbeddable',
        }
      );
    });
  }

  public async create(initialInput: ContactCardEmbeddableInput, parent?: Container) {
    return new ContactCardEmbeddable(initialInput, parent);
  }
}

embeddableFactories.registerFactory(new ContactCardEmbeddableFactory());
