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
  EmbeddableInput,
  Embeddable,
  EmbeddableOutput,
  IEmbeddable,
} from 'plugins/embeddable_api/index';

export const SAY_HELLO_ACTION = 'SAY_HELLO_ACTION';

interface SayHelloEmbeddableOutput extends EmbeddableOutput {
  fullName: string;
}

type SayHelloEmbeddable = Embeddable<EmbeddableInput, SayHelloEmbeddableOutput>;

function hasFullNameOutput(
  embeddable: IEmbeddable | Embeddable<EmbeddableInput, SayHelloEmbeddableOutput>
) {
  return (
    (embeddable as Embeddable<EmbeddableInput, SayHelloEmbeddableOutput>).getOutput().fullName !==
    undefined
  );
}

function openSayHelloFlyout(hello: string) {
  getNewPlatform().start.core.overlays.openFlyout(<EuiFlyoutBody>{hello}</EuiFlyoutBody>);
}

export class SayHelloAction extends Action {
  private sayHello: (name: string) => void;

  // Taking in a function, instead of always directly interacting with the dom,
  // can make testing the execute part of the action easier.
  constructor(sayHello: (name: string) => void = openSayHelloFlyout) {
    super(SAY_HELLO_ACTION);
    this.sayHello = sayHello;
  }

  getDisplayName() {
    return 'Say hello';
  }

  // Can use typescript generics to get compiler time warnings for immediate feedback if
  // the context is not compatible.
  isCompatible(context: ActionContext<SayHelloEmbeddable>) {
    // Option 1: only compatible with Greeting Embeddables.
    // return Promise.resolve(context.embeddable.type === CONTACT_CARD_EMBEDDABLE);

    // Option 2: require an embeddable with a specific input or output shape
    return Promise.resolve(hasFullNameOutput(context.embeddable));
  }

  async execute(context: ExecuteActionContext<SayHelloEmbeddable, { message?: string }>) {
    if (!(await this.isCompatible(context))) {
      throw new IncompatibleActionError();
    }

    const greeting = `Hello, ${context.embeddable.getOutput().fullName}`;

    if (context.triggerContext && context.triggerContext.message) {
      this.sayHello(`${greeting}.  ${context.triggerContext.message}`);
    } else {
      this.sayHello(greeting);
    }
  }
}

actionRegistry.addAction(new SayHelloAction());
triggerRegistry.attachAction({ triggerId: CONTEXT_MENU_TRIGGER, actionId: SAY_HELLO_ACTION });
