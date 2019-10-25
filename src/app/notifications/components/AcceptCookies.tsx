import React, { Component } from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { ActionType } from 'typesafe-actions';
import Button, { ButtonGroup } from '../../components/Button';
import { Dispatch } from '../../types';
import { assertString } from '../../utils';
import { doAcceptCookies } from '../acceptCookies';
import { acceptCookies, dismissNotification } from '../actions';
import { Body, Group, Header, P } from './Card';

interface Props {
  dismiss: () => void;
  className?: string;
}

// tslint:disable-next-line:variable-name
class AcceptCookies extends Component<Props> {
  public render = () => <Body className={this.props.className}>
    <Group>
      <FormattedMessage id='i18n:notification:cookies:header'>
        {(txt) => <Header>{txt}</Header>}
      </FormattedMessage>
      <FormattedHTMLMessage id='i18n:notification:cookies:body'>
        {(html) => <P
        dangerouslySetInnerHTML={{__html: assertString(html, 'i18n:notification:cookies:body must return a string')}}
        />}
      </FormattedHTMLMessage>
      <ButtonGroup>
        <FormattedMessage id='i18n:notification:cookies:ok'>
          {(txt) => <Button variant='primary' onClick={this.props.dismiss}>{txt}</Button>}
        </FormattedMessage>
      </ButtonGroup>
    </Group>
  </Body>;
}

export default connect(
  () => ({
  }),
  (dispatch: Dispatch, ownProps: {notification: ActionType<typeof acceptCookies>}) => ({
    dismiss: () => {
      dispatch(dismissNotification(ownProps.notification));
      doAcceptCookies();
    },
  })
)(AcceptCookies);
