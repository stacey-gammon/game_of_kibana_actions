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
import { Location } from '../embeddables/contact_card';
import {
  Action,
  ActionContext,
  ExecuteActionContext,
  actionRegistry,
} from '../../../../src/legacy/core_plugins/embeddable_api/public/index';
import { ContactCardEmbeddable } from '../embeddables';
import { CONTACT_CARD_EMBEDDABLE } from '../embeddables/contact_card/contact_card_embeddable_factory';

export const WAR_COUNCIL_ACTION = 'WAR_COUNCIL_ACTION';

export class WarCouncilAction extends Action {
  constructor() {
    super(WAR_COUNCIL_ACTION);
  }

  getDisplayName() {
    return 'Consult war council';
  }

  async isCompatible(context: ActionContext<ContactCardEmbeddable>) {
    return context.embeddable.type === CONTACT_CARD_EMBEDDABLE;
  }

  getAdvice(context: ExecuteActionContext<ContactCardEmbeddable, { targetLocation: Location }>) {
    if (!context.triggerContext) {
      return {
        recommended: false,
        reason: 'Going somewhere, not nowhere.',
      };
    }

    const currentLocation = context.embeddable.getInput().location;
    const targetLocation = context.triggerContext.targetLocation;
    const lastName = context.embeddable.getInput().lastName;

    if (currentLocation === targetLocation) {
      if (lastName === 'Stark' && currentLocation === Location.KINGS_LANDING) {
        return {
          recommended: false,
          reason: 'Kings landing is dangerous for Starks! Get out, do not stay.',
        };
      }
      if (currentLocation === Location.BEYOND_THE_WALL) {
        return {
          recommended: false,
          reason: 'Do not stay here, get out now!',
        };
      }
    }

    if (targetLocation === Location.BEYOND_THE_WALL) {
      return {
        recommended: false,
        reason: 'It is too dangerous, many will die and join the Night Kings army!',
      };
    }

    if (targetLocation === Location.KINGS_LANDING) {
      if (lastName === 'Stark') {
        return {
          recommended: false,
          reason: 'Death is almost certain',
        };
      } else {
        return {
          recommended: true,
          reason: 'Cersei must be destroyed! Good luck!',
        };
      }
    }

    if (targetLocation === Location.WINTERFELL) {
      if (lastName === 'Lannister') {
        return {
          recommended: false,
          reason: 'The north remembers',
        };
      } else {
        return {
          recommended: true,
          reason: 'Safe for most.',
        };
      }
    }
  }

  async execute(
    context: ExecuteActionContext<ContactCardEmbeddable, { targetLocation: Location }>
  ) {
    if (!context.triggerContext) return;
    const advice = this.getAdvice(context);
    const location = context.triggerContext.targetLocation;

    if (advice) {
      getNewPlatform().start.core.overlays.openFlyout(
        <React.Fragment>
          <EuiFlyoutHeader>{`Recommendation: ${
            advice.recommended ? `You may travel to ${location}` : `Stay away from ${location}`
          }`}</EuiFlyoutHeader>
          <EuiFlyoutBody>
            <EuiCallOut color={advice.recommended ? 'success' : 'danger'}>
              {advice.reason}
            </EuiCallOut>
          </EuiFlyoutBody>
        </React.Fragment>
      );
    }
  }
}

actionRegistry.addAction(new WarCouncilAction());
