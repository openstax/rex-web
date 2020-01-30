import { getType } from 'typesafe-actions';
import * as actions from './actions';
import { appMessageType } from './reducer';

import { AnyNotification, AppMessageNotification, QueuelessNotifications } from './types';

export const isAppMessage = (message: AnyNotification): message is AppMessageNotification =>
  message.type === appMessageType;

export const isQueuelessNotification =
  (notification: AnyNotification): notification is QueuelessNotifications =>
    notification.type === getType(actions.searchFailure);
