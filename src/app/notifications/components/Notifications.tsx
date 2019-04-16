import React, { SFC } from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { getType } from 'typesafe-actions';
import theme from '../../theme';
import { AppState } from '../../types';
import * as actions from '../actions';
import * as select from '../selectors';
import { inlineDisplayBreak } from '../theme';
import { AnyNotification } from '../types';
import UpdatesAvailable from './UpdatesAvailable';

interface Props extends React.HTMLProps<HTMLDivElement> {
  notifications: AnyNotification[];
  className?: string;
}

// tslint:disable-next-line:variable-name
const Notifications: SFC<Props> = ({notifications, className}) => notifications.length === 0
  ? null
  : <div className={className}>
    {notifications.map((notification, index) => {
      switch (notification.type) {
        case getType(actions.updateAvailable): {
          return <UpdatesAvailable key={index} />;
        }
      }
    })}
  </div>;

const connector = connect(
  (state: AppState) => ({
    notifications: select.notifications(state),
  })
);

// TODO - magic number to be replaced in `top` when scroll behavior is developed in openstax/unified#179
export default styled(connector(Notifications))`
  z-index: 2; /* on top of the navbar */
  top: 0;
  right: 0;
  overflow: visible;
  position: fixed;

  @media (max-width: ${inlineDisplayBreak}) {
    z-index: 1; /* below the navbar */
    position: sticky;
    border-bottom: thin solid ${theme.color.neutral.darkest};
    padding: 0 ${theme.padding.page.desktop}rem;
    ${theme.breakpoints.mobile(css`
      padding: 0 ${theme.padding.page.mobile}rem;
    `)}
  }
`;
