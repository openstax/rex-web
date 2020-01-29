import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getType } from 'typesafe-actions';
import { AppState } from '../../types';
import * as actions from '../actions';
import { appMessageType } from '../reducer';
import * as select from '../selectors';
import { AnyNotification, State } from '../types';
import AcceptCookies from './AcceptCookies';
import AppMessage from './AppMessage';
import SearchFailure from './SearchFailure';
import UpdatesAvailable from './UpdatesAvailable';

interface Props {
  notifications: {
    firstInQueue: State['notificationQueue'][0] | undefined
    queuelessNotifications: State['queuelessNotifications']
  };
  className?: string;
}

const renderNotification = (
  notification: AnyNotification,
  className?: string
) => {
  switch (notification.type) {
    case getType(actions.updateAvailable): {
      return <UpdatesAvailable className={className} />;
    }
    case getType(actions.acceptCookies): {
      return (
        <AcceptCookies notification={notification} className={className} />
      );
    }
    case getType(actions.searchFailure): {
      return (
        <SearchFailure notification={notification}/>
      );
    }
    case appMessageType: {
      return <AppMessage notification={notification} className={className} />;
    }
    default:
      return null;
  }
};

export class Notifications extends Component<Props> {
  public render() {
    const { notifications: {firstInQueue, queuelessNotifications}, className } = this.props;
    const notificationsToRender = [...queuelessNotifications, firstInQueue || null ];

    return notificationsToRender.map((notificaton) => notificaton ? renderNotification(notificaton, className) : null);
  }
}

export default connect((state: AppState) => ({
  notifications: select.notificationForDisplay(state),
}))(Notifications);
