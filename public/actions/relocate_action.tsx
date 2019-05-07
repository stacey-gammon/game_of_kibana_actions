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

import { Location } from '../embeddables/contact_card';
import { Action, ActionContext, ExecuteActionContext, actionRegistry } from '../../actions';
import { ContactCardEmbeddable } from '../embeddables';
import { CONTACT_CARD_EMBEDDABLE } from '../embeddables/contact_card/contact_card_embeddable_factory';

export const RELOCATE_ACTION = 'RELOCATE_ACTION';

export class RelocateAction extends Action {
  constructor() {
    super(RELOCATE_ACTION);
  }

  getDisplayName() {
    return 'Relocate';
  }

  async isCompatible(context: ActionContext<ContactCardEmbeddable>) {
    return context.embeddable.type === CONTACT_CARD_EMBEDDABLE;
  }

  async execute(
    context: ExecuteActionContext<ContactCardEmbeddable, { targetLocation: Location }>
  ) {
    if (!context.triggerContext) {
      return;
    }

    context.embeddable.updateInput({ location: context.triggerContext.targetLocation });

    switch (context.triggerContext.targetLocation) {
      case Location.BEYOND_THE_WALL: {
        switch (context.embeddable.getInput().lastName) {
          case 'Stark': {
            context.embeddable.updateInput({ mood: 'brave' });
            return;
          }
          case 'Targaryen': {
            context.embeddable.updateInput({ mood: 'worried' });
            return;
          }
          default: {
            context.embeddable.updateInput({ mood: 'terrified' });
            context.embeddable.updateInput({ isAlive: Boolean(Math.random() < 0.2) });
          }
        }
      }
      case Location.KINGS_LANDING: {
        switch (context.embeddable.getInput().lastName) {
          case 'Stark': {
            context.embeddable.updateInput({ mood: 'brave' });
            context.embeddable.updateInput({ isAlive: false });
            return;
          }
          case 'Targaryen': {
            context.embeddable.updateInput({ mood: 'worried' });
            context.embeddable.updateInput({ isAlive: Boolean(Math.random() < 0.5) });
            return;
          }
          case 'Lannister': {
            context.embeddable.updateInput({ mood: 'cozy' });
            return;
          }
          default: {
            context.embeddable.updateInput({ isAlive: Boolean(Math.random() < 0.5) });
          }
        }
      }
      case Location.WINTERFELL: {
        switch (context.embeddable.getInput().lastName) {
          case 'Stark': {
            context.embeddable.updateInput({ mood: 'happy' });
            return;
          }
          case 'Targaryen': {
            context.embeddable.updateInput({ mood: 'lonely' });
            return;
          }
          default: {
            context.embeddable.updateInput({ isAlive: Boolean(Math.random() < 0.8) });
          }
        }
      }
    }
  }
}

actionRegistry.addAction(new RelocateAction());
