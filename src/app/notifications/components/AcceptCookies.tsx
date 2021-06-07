import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { ActionType } from 'typesafe-actions';
import Button, { ButtonGroup } from '../../components/Button';
import { htmlMessage } from '../../components/htmlMessage';
import { Dispatch } from '../../types';
import { doAcceptCookies } from '../acceptCookies';
import { acceptCookies, dismissNotification } from '../actions';
import { Body, Group, Header, P } from './Card';

// tslint:disable-next-line:variable-name
const Content = htmlMessage('i18n:notification:cookies:body', P);

// tslint:disable-next-line:variable-name
const AcceptCookies = ({dismiss, className}:
  {dismiss: () => void, className?: string}) => <Body className={className}>
    <Group>
      <FormattedMessage id='i18n:notification:cookies:header'>
        {(txt) => <Header>{txt}</Header>}
      </FormattedMessage>
      <Content />
      <ButtonGroup>
        <FormattedMessage id='i18n:notification:cookies:ok'>
          {(txt) => <Button variant='primary' onClick={dismiss}>{txt}</Button>}
        </FormattedMessage>
      </ButtonGroup>
    </Group>
  </Body>;

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
