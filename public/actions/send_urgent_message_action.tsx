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
import { getNewPlatform } from 'ui/new_platform';
import { EuiFlyoutBody, EuiFlyoutHeader, EuiCallOut } from '@elastic/eui';
import {
  Action,
  ActionContext,
  ExecuteActionContext,
  actionRegistry,
  triggerRegistry,
  IncompatibleActionError,
} from 'plugins/embeddable_api/index';
import { GotCharacterCardEmbeddable } from '../embeddables';
import { GOT_CHARACTER_CARD_EMBEDDABLE } from '../embeddables/got_character_card/got_character_card_embeddable_factory';
import { GetMessageModal } from './get_message_modal';
import { CONTACT_CHARACTER_TRIGGER } from '../embeddables/got_character_card/got_character_card_embeddable';

export const SEND_URGENT_MESSAGE_ACTION = 'SEND_URGENT_MESSAGE_ACTION';

export class SendUrgentMessageAction extends Action {
  constructor() {
    super(SEND_URGENT_MESSAGE_ACTION);
  }

  getDisplayName() {
    return 'Send urgent message';
  }

  async isCompatible(context: ActionContext<GotCharacterCardEmbeddable>) {
    return context.embeddable.type === GOT_CHARACTER_CARD_EMBEDDABLE;
  }

  async sendMessage(context: ExecuteActionContext<GotCharacterCardEmbeddable>, message: string) {
    const greeting = `HELP ${context.embeddable
      .getOutput()
      .fullName.toUpperCase()}!!!!! !!! IMPORTANT!!! READ ME NOW!!`;

    getNewPlatform().start.core.overlays.openFlyout(
      <React.Fragment>
        <EuiFlyoutHeader>{greeting}</EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiCallOut color="danger">{message.toUpperCase()}</EuiCallOut>
        </EuiFlyoutBody>
      </React.Fragment>
    );
  }

  async execute(context: ExecuteActionContext<GotCharacterCardEmbeddable, { message?: string }>) {
    if (!(await this.isCompatible(context))) {
      throw new IncompatibleActionError();
    }

    const modal = getNewPlatform().start.core.overlays.openModal(
      <GetMessageModal
        onCancel={() => modal.close()}
        onDone={message => {
          modal.close();
          this.sendMessage(context, message);
        }}
      />
    );
  }
}

actionRegistry.addAction(new SendUrgentMessageAction());

triggerRegistry.attachAction({
  triggerId: CONTACT_CHARACTER_TRIGGER,
  actionId: SEND_URGENT_MESSAGE_ACTION,
});
