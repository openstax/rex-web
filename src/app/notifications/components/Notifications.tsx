import React, { SFC } from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import { getType } from 'typesafe-actions';
import theme from '../../theme';
import { AppState } from '../../types';
import * as actions from '../actions';
import * as select from '../selectors';
import { inlineDisplayBreak } from '../theme';
import { AnyNotification } from '../types';
import UpdatesAvailable from './UpdatesAvailable';

// TODO - magic number to be replaced in `top` when scroll behavior is developed in openstax/unified#179
// tslint:disable-next-line:variable-name
const Container = styled.div`
  z-index: 2; /* on top of the navbar */
  top: 0;
  right: 0;
  overflow: visible;
  position: fixed;

  @media (max-width: ${inlineDisplayBreak}) {
    z-index: 1; /* below the navbar */
    position: sticky;
    border-bottom: thin solid ${theme.color.neutral.darkest};
    padding: 0 ${theme.padding.page.mobile}rem;

    ${theme.breakpoints.mobile(css`
      padding: 0 ${theme.padding.page.mobile}rem;
    `)}
  }
`;

interface Props extends React.HTMLProps<HTMLDivElement> {
  notifications: AnyNotification[];
  className?: string;
}

// tslint:disable-next-line:variable-name
const Notifications: SFC<Props> = ({notifications, className}) => <Container className={className}>
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
