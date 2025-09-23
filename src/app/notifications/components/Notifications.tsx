import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getType } from 'typesafe-actions';
import { AppState } from '../../types';
import * as actions from '../actions';
import { appMessageType } from '../reducer';
import * as select from '../selectors';
import { ModalNotification } from '../types';
import AppMessage from './AppMessage';
import RetiredBookRedirect from './RetiredBookRedirect';
import UpdatesAvailable from './UpdatesAvailable';

interface Props {
  notification?: ModalNotification | undefined;
  className?: string;
}

const renderNotificationModal = (
  notification: ModalNotification,
  className?: string
) => {
  switch (notification.type) {
    case getType(actions.retiredBookRedirect): {
      return <RetiredBookRedirect notification={notification} className={className} />;
    }
    case getType(actions.updateAvailable): {
      return <UpdatesAvailable className={className} />;
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
    const { notification, className } = this.props;
    return notification ? renderNotificationModal(notification, className) : null;
  }
}

export default connect((state: AppState) => ({
  notification: select.modalNotificationToDisplay(state),
}))(Notifications);
