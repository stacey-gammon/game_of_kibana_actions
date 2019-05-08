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
import {
  GotCharacterCardEmbeddable,
  GotCharacterCardEmbeddableInput,
} from './got_character_card_embeddable';
import { GotCharacterCardInitializer } from './got_character_card_initializer';
import { Location } from './got_character_card';

export const GOT_CHARACTER_CARD_EMBEDDABLE = 'GOT_CHARACTER_CARD_EMBEDDABLE';

function randomlyChoose<T>(options: T[]): T {
  const index = Math.floor(Math.random() * options.length);
  return options[index];
}

export class GotCharacterCardEmbeddableFactory extends EmbeddableFactory<
  GotCharacterCardEmbeddableInput
> {
  public readonly type = GOT_CHARACTER_CARD_EMBEDDABLE;

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

  public getDefaultInput(partial: Partial<GotCharacterCardEmbeddableInput>) {
    return {
      isAlive: true,
      mood: this.getDefaultMood(partial.lastName),
      location: this.getDefaultLocation(partial.lastName),
    };
  }

  public getDisplayName() {
    return i18n.translate('kbn.embeddable.samples.contactCard.displayName', {
      defaultMessage: 'character card',
    });
  }

  public getExplicitInput(): Promise<Partial<GotCharacterCardEmbeddableInput>> {
    return new Promise(resolve => {
      const modalSession = getNewPlatform().start.core.overlays.openModal(
        <GotCharacterCardInitializer
          onCancel={() => {
            modalSession.close();
            resolve(undefined);
          }}
          onCreate={(input: { firstName: string; lastName: string }) => {
            modalSession.close();
            resolve(input);
          }}
        />
      );
    });
  }

  public async create(initialInput: GotCharacterCardEmbeddableInput, parent?: Container) {
    return new GotCharacterCardEmbeddable(initialInput, parent);
  }
}

// embeddableFactories.registerFactory(new GotCharacterCardEmbeddableFactory());
