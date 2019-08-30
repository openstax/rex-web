import React from 'react';
import { connect } from 'react-redux';
import Button from '../../components/Button';
import * as notifications from '../../notifications/actions';
import { Dispatch } from '../../types';
import demoAppMessages from '../sample-app-messages.json';
import Panel from './Panel';

interface Props {
  updateAvailable: () => void;
  sendMessages: () => void;
}

// tslint:disable-next-line:variable-name
const Notifications = ({updateAvailable, sendMessages}: Props) => <Panel title='Notifications'>
  <Button onClick={updateAvailable}>update available</Button>
  <Button onClick={sendMessages}>message</Button>
</Panel>;

export default connect<{}, React.ComponentProps<typeof Notifications>>(
  () => ({}),
  (dispatch: Dispatch): Props => ({
    sendMessages: () => dispatch(notifications.receiveMessages(demoAppMessages)),
    updateAvailable: () => dispatch(notifications.updateAvailable()),
  })
)(Notifications);
