import flow from 'lodash/fp/flow';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import Button, { ButtonGroup } from '../../components/Button';
import { recordError } from '../../errors/actions';
import * as notifications from '../../notifications/actions';
import { Dispatch } from '../../types';
import Panel from './Panel';

interface Props {
  updateAvailable: () => void;
  error: (error: Error) => void;
}

// tslint:disable-next-line:variable-name
const Notifications = ({updateAvailable, error}: Props) => {
  const [showError, setError] = useState(false);

  if (showError) {
    throw new Error();
  }

  return <Panel title='Notifications'>
    <ButtonGroup expand={false}>
      <Button onClick={updateAvailable} data-testid='trigger-updates-available'>update available</Button>
      <Button onClick={() => setError(true)}>inline error</Button>
      <Button onClick={() => error(new Error('this is an error'))}>modal error</Button>
    </ButtonGroup>
  </Panel>;
};

export default connect<{}, React.ComponentProps<typeof Notifications>>(
  () => ({}),
  (dispatch: Dispatch): Props => ({
    error: flow(recordError, dispatch),
    updateAvailable: flow(notifications.updateAvailable, dispatch),
  })
)(Notifications);
