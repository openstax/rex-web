import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import Button, { ButtonGroup } from '../../components/Button';
import { Dispatch } from '../../types';
import { dismissNotification } from '../actions';
import { dismissAppMessage } from '../dismissAppMessages';
import { AppMessageNotification } from '../types';
import { Body, Group, P } from './Card';

// tslint:disable-next-line:variable-name
const AppMessage = ({dismiss, notification}: {dismiss: () => void, notification: AppMessageNotification}) => <Body>
  <Group>
    <P dangerouslySetInnerHTML={{__html: notification.payload.html}} />
    {!!notification.payload.dismissable && <ButtonGroup>
      <FormattedMessage id='i18n:notification:appmessage:dismiss'>
        {(txt) => <Button variant='primary' onClick={dismiss}>{txt}</Button>}
      </FormattedMessage>
    </ButtonGroup>}
  </Group>
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
