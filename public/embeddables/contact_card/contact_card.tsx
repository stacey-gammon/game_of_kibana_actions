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
import {
  // @ts-ignore
  EuiCard,
  EuiFlexItem,
  EuiFlexGroup,
  EuiFormRow,
  // @ts-ignore
  EuiSuperSelect,
} from '@elastic/eui';

import { Subscription } from 'rxjs';
import { EuiButton } from '@elastic/eui';
import { executeTriggerActions } from 'plugins/embeddable_api/triggers';
import * as Rx from 'rxjs';
import {
  ContactCardEmbeddable,
  CONTACT_USER_TRIGGER,
  CHANGE_LOCATION_TRIGGER,
} from './contact_card_embeddable';

interface Props {
  embeddable: ContactCardEmbeddable;
}

interface State {
  fullName: string;
  sigilUrl: string;
  isAlive: boolean;
  firstName: string;
  mood: string;
  location: string;
  targetLocation: string;
}

export enum Location {
  KINGS_LANDING = 'Kings Landing',
  WINTERFELL = 'Winterfell',
  BEYOND_THE_WALL = 'Beyond the Wall',
}

export class ContactCardEmbeddableComponent extends React.Component<Props, State> {
  private subscription?: Subscription;
  private mounted: boolean = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      fullName: this.props.embeddable.getOutput().fullName,
      sigilUrl: this.props.embeddable.getOutput().sigilImageUrl,
      isAlive: this.props.embeddable.getInput().isAlive,
      firstName: this.props.embeddable.getInput().firstName,
      mood: this.props.embeddable.getInput().mood,
      location: this.props.embeddable.getInput().location,
      targetLocation: this.props.embeddable.getInput().location,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.subscription = Rx.merge(
      this.props.embeddable.getInput$(),
      this.props.embeddable.getOutput$()
    ).subscribe(() => {
      if (this.mounted) {
        this.setState({
          fullName: this.props.embeddable.getOutput().fullName,
          sigilUrl: this.props.embeddable.getOutput().sigilImageUrl,
          isAlive: this.props.embeddable.getInput().isAlive,
          firstName: this.props.embeddable.getInput().firstName,
          mood: this.props.embeddable.getInput().mood,
          location: this.props.embeddable.getInput().location,
          targetLocation: this.props.embeddable.getInput().location,
        });
      }
    });
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.mounted = false;
  }

  emitContactTrigger = () => {
    executeTriggerActions(CONTACT_USER_TRIGGER, {
      embeddable: this.props.embeddable,
      triggerContext: {},
    });
  };

  emitChangeLocationTrigger = () => {
    executeTriggerActions(CHANGE_LOCATION_TRIGGER, {
      embeddable: this.props.embeddable,
      triggerContext: {
        targetLocation: this.state.targetLocation,
      },
    });
  };

  LOCATION_OPTIONS = [
    {
      value: Location.KINGS_LANDING,
      inputDisplay: Location.KINGS_LANDING,
    },
    {
      value: Location.WINTERFELL,
      inputDisplay: Location.WINTERFELL,
    },
    {
      value: Location.BEYOND_THE_WALL,
      inputDisplay: Location.BEYOND_THE_WALL,
    },
  ];

  getCardFooterContent = () => (
    <EuiFlexGroup justifyContent="flexEnd">
      <EuiFlexItem grow={true}>
        <EuiSuperSelect
          options={this.LOCATION_OPTIONS}
          disabled={!this.state.isAlive}
          valueOfSelected={this.state.targetLocation}
          onChange={(value: string) => this.setState({ targetLocation: value })}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButton disabled={!this.state.isAlive} onClick={this.emitChangeLocationTrigger}>
          Update location
        </EuiButton>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFormRow label="">
          <EuiButton disabled={!this.state.isAlive} onClick={this.emitContactTrigger}>
            Contact
          </EuiButton>
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  render() {
    return (
      <EuiCard
        textAlign="left"
        image={this.state.sigilUrl}
        title={this.state.isAlive ? this.state.fullName : `RIP ${this.state.fullName}`}
        footer={this.getCardFooterContent()}
        description={`${this.state.firstName}, currently located at ${
          this.state.location
        }, is feeling ${this.state.isAlive ? this.state.mood : 'nothing because they are dead'}`}
      />
    );
  }
}
