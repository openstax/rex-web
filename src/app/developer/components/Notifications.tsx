import React from 'react';
import { connect } from 'react-redux';
import Button from '../../components/Button';
import * as notifications from '../../notifications/actions';
import { Dispatch } from '../../types';
import Panel from './Panel';

interface Props {
  updateAvailable: () => void;
}

// tslint:disable-next-line:variable-name
const Notifications: React.SFC<Props> = ({updateAvailable}) => <Panel title='Notifications'>
  <Button onClick={updateAvailable}>update available</Button>
</Panel>;

export default connect(
  () => ({}),
  (dispatch: Dispatch) => ({
    updateAvailable: () => dispatch(notifications.updateAvailable()),
  })
)(Notifications);
