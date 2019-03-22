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

// TODO - magic number to be replaced in `top` when scroll behavior is developed in openstax/unified#179
// tslint:disable-next-line:variable-name
const Container = styled.div`
  z-index: 2;
  top: 23rem;
  overflow: visible;
  position: fixed;
  right: 0;

  @media (max-width: ${inlineDisplayBreak}) {
    position: sticky;
    right: inital;
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
