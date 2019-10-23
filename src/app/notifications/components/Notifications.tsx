import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getType } from 'typesafe-actions';
import { AppState } from '../../types';
import * as actions from '../actions';
import { appMessageType } from '../reducer';
import * as select from '../selectors';
import { AnyNotification } from '../types';
import AcceptCookies from './AcceptCookies';
import AppMessage from './AppMessage';
import { UpdatesAvailable } from './UpdatesAvailable';

interface Props {
  notifications: AnyNotification;
  className?: string;
}

const renderNotification = (notification: AnyNotification, className: string) => {
  if (notification) {
    switch (notification.type) {
      case getType(actions.updateAvailable): {
        return <UpdatesAvailable className={className}/>;
      }
      case getType(actions.acceptCookies): {
        return <AcceptCookies notification={notification}/>;
      }
      case appMessageType: {
        return <AppMessage notification={notification}/>;
      }
      default:
        return null;
    }
  }
};

export class Notifications extends Component<Props> {
  public render() {
    const {notifications, className} = this.props;
    console.log(className);
    return (notifications && className) ? renderNotification(notifications, className) : null;
  }
}

export default connect(
  (state: AppState) => ({
    notifications: select.notificationsForDisplay(state),
  })
)(Notifications);
