import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import Button, { ButtonGroup } from '../../components/Button';
import { Dispatch } from '../../types';
import { dismissNotification } from '../actions';
import { dismissAppMessage } from '../dismissAppMessages';
import { AppMessageNotification } from '../types';
import { Body, Group, Header, P } from './Card';

const AppMessage = ({dismiss, notification, className}:
  {dismiss: () => void, notification: AppMessageNotification, className?: string}) => <Body className={className}>
  <Group>
    <FormattedMessage id='i18n:notification:appmessage:header'>
      {(txt) => <Header>{txt}</Header>}
    </FormattedMessage>
    <P dangerouslySetInnerHTML={{__html: notification.payload.html}} />
  </Group>
  <ButtonGroup>
    <FormattedMessage id='i18n:notification:appmessage:dismiss'>
      {(txt) => <Button variant='primary' onClick={dismiss}>{txt}</Button>}
    </FormattedMessage>
  </ButtonGroup>
</Body>;

export default connect(
  () => ({
  }),
  (dispatch: Dispatch, ownProps: {notification: AppMessageNotification}) => ({
    dismiss: () => {
      dispatch(dismissNotification(ownProps.notification));
      dismissAppMessage(ownProps.notification.payload);
    },
  })
)(AppMessage);
