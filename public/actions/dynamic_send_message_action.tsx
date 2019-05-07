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
import { EuiFlyoutBody, EuiCallOut, EuiFlyoutHeader } from '@elastic/eui';
import { triggerRegistry } from '../../triggers';
import {
  Action,
  ActionContext,
  ExecuteActionContext,
  actionRegistry,
  IncompatibleActionError,
} from '../../actions';
import { ContactCardEmbeddable } from '../embeddables';
import { CONTACT_CARD_EMBEDDABLE } from '../embeddables/contact_card';
import { GetMessageModal } from './get_message_modal';
import { CONTACT_USER_TRIGGER } from '../embeddables/contact_card/contact_card_embeddable';

export const DYNAMIC_SEND_MESSAGE_ACTION = 'DYNAMIC_SEND_MESSAGE_ACTION';

export class DynamicSendMessageAction extends Action {
  private isEmergency: boolean;
  constructor(isEmergency: boolean = true, id: string) {
    super(id);
    this.isEmergency = isEmergency;
  }

  getDisplayName() {
    return this.isEmergency ? 'Send urgent message via dragon' : 'Send status update via raven';
  }

  async isCompatible(context: ActionContext<ContactCardEmbeddable>) {
    return context.embeddable.type === CONTACT_CARD_EMBEDDABLE;
  }

  async sendMessage(context: ExecuteActionContext<ContactCardEmbeddable>, message: string) {
    const greeting = this.isEmergency
      ? `HELP ${context.embeddable
          .getOutput()
          .fullName.toUpperCase()}!!!!! !!! IMPORTANT!!! READ ME NOW!!`
      : `Dear ${context.embeddable.getOutput().fullName}`;

    const bodyContent = (
      <EuiCallOut color={this.isEmergency ? 'danger' : 'success'}>
        {this.isEmergency ? message : message.toUpperCase()}
      </EuiCallOut>
    );

    getNewPlatform().start.core.overlays.openFlyout(
      <React.Fragment>
        <EuiFlyoutHeader>{greeting}</EuiFlyoutHeader>
        <EuiFlyoutBody>{bodyContent}</EuiFlyoutBody>
      </React.Fragment>
    );
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

actionRegistry.addAction(new DynamicSendMessageAction(true, 'sendUrgentMessage'));
actionRegistry.addAction(new DynamicSendMessageAction(false, 'sendStatusUpdate'));

triggerRegistry.attachAction({ triggerId: CONTACT_USER_TRIGGER, actionId: 'sendUrgentMessage' });
triggerRegistry.attachAction({ triggerId: CONTACT_USER_TRIGGER, actionId: 'sendStatusUpdate' });
