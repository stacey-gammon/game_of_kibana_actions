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
  Action,
  ActionContext,
  ExecuteActionContext,
  actionRegistry,
  triggerRegistry,
  CONTEXT_MENU_TRIGGER,
} from 'plugins/embeddable_api/index';
import { GotCharacterCardEmbeddable } from '../embeddables';
import { GOT_CHARACTER_CARD_EMBEDDABLE } from '../embeddables/got_character_card/got_character_card_embeddable_factory';

export const RIDE_DRAGON = 'RIDE_DRAGON';

export class RideDragonAction extends Action {
  constructor() {
    super(RIDE_DRAGON);
  }

  getDisplayName() {
    return 'Ride dragon';
  }

  async isCompatible(context: ActionContext<GotCharacterCardEmbeddable>) {
    return (
      context.embeddable.type === GOT_CHARACTER_CARD_EMBEDDABLE &&
      context.embeddable.getInput().lastName === 'Targaryen'
    );
  }

  async execute(context: ExecuteActionContext<GotCharacterCardEmbeddable>) {
    if (context.embeddable.getInput().lastName === 'Targaryen') {
      context.embeddable.updateInput({ mood: 'high' });
    } else {
      context.embeddable.updateInput({ isAlive: false });
    }
  }
}

actionRegistry.addAction(new RideDragonAction());
triggerRegistry.attachAction({ triggerId: CONTEXT_MENU_TRIGGER, actionId: RIDE_DRAGON });
