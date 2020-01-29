import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export interface Message {
  id: string;
  html: string;
  dismissable: boolean;
  start_at: string | null;
  end_at: string | null;
  url_regex: string | null;
}

export interface AppMessageNotification {
  type: 'Notification/appMessage';
  payload: Message;
}

export type Messages = Message[];

export type NotificationsInQueue = ActionType<Pick<typeof actions, 'updateAvailable' | 'acceptCookies' >>
  | AppMessageNotification;

export type QueuelessNotifications = ActionType<Pick<typeof actions, 'searchFailure'>>;

export type AnyNotification = NotificationsInQueue | QueuelessNotifications;

export interface State {
  queuelessNotifications: QueuelessNotifications[];
  notificationQueue: NotificationsInQueue[];
}
