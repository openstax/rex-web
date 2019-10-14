import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import { getType } from 'typesafe-actions';
import { disablePrint } from '../../content/components/utils/disablePrint';
import theme from '../../theme';
import { AppState } from '../../types';
import * as actions from '../actions';
import { appMessageType } from '../reducer';
import * as select from '../selectors';
import { inlineDisplayBreak } from '../theme';
import { AnyNotification } from '../types';
import AcceptCookies from './AcceptCookies';
import AppMessage from './AppMessage';
import UpdatesAvailable from './UpdatesAvailable';

interface Props extends React.HTMLProps<HTMLDivElement> {
  notification: AnyNotification;
  className?: string;
}

const renderNotificacion = (notification: AnyNotification) => {
  if (notification) {
    switch (notification.type) {
    case getType(actions.updateAvailable): {
      return <UpdatesAvailable />;
    }
    case getType(actions.acceptCookies): {
      return <AcceptCookies notification={notification} />;
    }
    case appMessageType: {
      return <AppMessage notification={notification} />;
    }
    default:
      return null;
    }
  }
};

// tslint:disable-next-line:variable-name
const Notifications = ({notification, className}: Props) => !notification
  ? null
  : <div className={className}> { renderNotificacion(notification) } </div>;

const connector = connect(
  (state: AppState) => ({
    notifications: select.notificationsForDisplay(state),
  })
);

const notificationWidth = 30;

export default styled(connector(Notifications))`
  width: ${notificationWidth}rem;
  height: 0;
  margin-left: calc(100% - ${notificationWidth}rem);
  top: 0;
  overflow: visible;
  position: sticky;
  padding-top: 1px; /* clear child margin */
  margin-top: -1px; /* clear child margin */

  @media (max-width: ${inlineDisplayBreak}) {
    box-shadow: inset 0 -0.2rem 0.2rem 0 rgba(0, 0, 0, 0.14);
    background-color: ${theme.color.neutral.darker};
    margin: 0;
    height: auto;
    width: 100%;
  }

  ${disablePrint}
`;
