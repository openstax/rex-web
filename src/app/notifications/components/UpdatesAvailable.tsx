import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Button, { ButtonGroup } from '../../components/Button';
import { Body, Group, Header, P } from './Card';

export class UpdatesAvailable extends Component<{className: string}> {
  public reload = () => {
    if (typeof(window) !== 'undefined') {
      window.location.reload(true);
    }
  };

  // tslint:disable-next-line:variable-name
  public render = () => <Body className={this.props.className}>
    <Group>
      <FormattedMessage id='i18n:notification:update:header'>
        {(txt) => (<Header>{txt}</Header>)}
      </FormattedMessage>
      <FormattedMessage id='i18n:notification:update:body'>
        {(txt) => (<P>{txt}</P>)}
      </FormattedMessage>
    </Group>
    <ButtonGroup>
      <FormattedMessage id='i18n:notification:update:reload'>
        {(txt) => (<Button variant='primary' onClick={this.reload}>{txt}</Button>)}
      </FormattedMessage>
    </ButtonGroup>
  </Body>;
}

