import React, { SFC } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { getType } from 'typesafe-actions';
import { AppState } from '../../types';
import * as actions from '../actions';
import * as select from '../selectors';
import { inlineDisplayBreak } from '../theme';
import { AnyNotification } from '../types';
import UpdatesAvailable from './UpdatesAvailable';

// tslint:disable-next-line:variable-name
const Container = styled.div`
  z-index: 2;
  top: 0;
  overflow: visible;

  @media (max-width: ${inlineDisplayBreak}) {
    position: sticky;
  }
  @media (min-width: ${inlineDisplayBreak}) {
    position: fixed;
    right: 0;
  }
`;

interface Props extends React.HTMLProps<HTMLDivElement> {
  notifications: AnyNotification[];
}

// tslint:disable-next-line:variable-name
const Notifications: SFC<Props> = ({notifications}) => <Container>
  {notifications.map((notification, index) => {
    switch (notification.type) {
      case getType(actions.updateAvailable): {
        return <UpdatesAvailable key={index} />;
      }
    }
  })}
</Container>;

export default connect(
  (state: AppState) => ({
    notifications: select.notifications(state),
  })
)(Notifications);
