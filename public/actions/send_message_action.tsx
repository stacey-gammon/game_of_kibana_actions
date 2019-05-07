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
import { EuiFlyoutBody } from '@elastic/eui';
import {
  Action,
  ActionContext,
  ExecuteActionContext,
  actionRegistry,
  IncompatibleActionError,
  triggerRegistry,
  CONTEXT_MENU_TRIGGER,
} from 'plugins/embeddable_api/index';
import { ContactCardEmbeddable } from '../embeddables';
import { CONTACT_CARD_EMBEDDABLE } from '../embeddables/contact_card/slow_contact_card_embeddable_factory';
import { GetMessageModal } from './get_message_modal';

export const SEND_MESSAGE_ACTION = 'SEND_MESSAGE_ACTION';

export class SendMessageAction extends Action {
  constructor() {
    super(SEND_MESSAGE_ACTION);
  }

  getDisplayName() {
    return 'Send message';
  }

  async isCompatible(context: ActionContext<ContactCardEmbeddable>) {
    return context.embeddable.type === CONTACT_CARD_EMBEDDABLE;
  }

  async sendMessage(context: ExecuteActionContext<ContactCardEmbeddable>, message: string) {
    const greeting = `Hello, ${context.embeddable.getOutput().fullName}`;

    const content = message ? `${greeting}. ${message}` : greeting;
    getNewPlatform().start.core.overlays.openFlyout(<EuiFlyoutBody>{content}</EuiFlyoutBody>);
  }

  async execute(context: ExecuteActionContext<ContactCardEmbeddable, { message?: string }>) {
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

actionRegistry.addAction(new SendMessageAction());
triggerRegistry.attachAction({ triggerId: CONTEXT_MENU_TRIGGER, actionId: SEND_MESSAGE_ACTION });
