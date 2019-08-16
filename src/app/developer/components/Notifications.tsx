import React from 'react';
import { connect } from 'react-redux';
import Button from '../../components/Button';
import * as notifications from '../../notifications/actions';
import { Dispatch } from '../../types';
import Panel from './Panel';

import demoAppMessages from '../sample-app-messages.json'

interface Props {
  updateAvailable: () => void;
  appMessages: () => void;
}

// tslint:disable-next-line:variable-name
const Notifications = ({updateAvailable, appMessages}: Props) => <Panel title='Notifications'>
  <Button onClick={updateAvailable}>update available</Button>
  <Button onClick={appMessages}>message</Button>
</Panel>;

export default connect<{}, React.ComponentProps<typeof Notifications>>(
  () => ({}),
  (dispatch: Dispatch): Props => ({
    updateAvailable: () => dispatch(notifications.updateAvailable()),
    appMessages: () => dispatch(notifications.appMessage(demoAppMessages)),
  })
)(Notifications);
