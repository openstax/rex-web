import React, { useState } from 'react';
import { connect } from 'react-redux';
import Button, { ButtonGroup } from '../../components/Button';
import * as notifications from '../../notifications/actions';
import { Dispatch } from '../../types';
import Panel from './Panel';

interface Props {
  updateAvailable: () => void;
}

// tslint:disable-next-line:variable-name
const Notifications = ({updateAvailable}: Props) => {
  const [showError, setError] = useState(false);

  if (showError) {
    throw new Error();
  }

  return <Panel title='Notifications'>
    <ButtonGroup expand={false}>
      <Button onClick={updateAvailable}>update available</Button>
      <Button onClick={() => setError(true)}>inline error</Button>
    </ButtonGroup>
  </Panel>;
};

export default connect<{}, React.ComponentProps<typeof Notifications>>(
  () => ({}),
  (dispatch: Dispatch): Props => ({
    updateAvailable: () => dispatch(notifications.updateAvailable()),
  })
)(Notifications);
