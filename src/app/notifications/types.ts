import { ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { ToastVariant } from './components/ToastNotifications/styles';

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

export type ModalNotification = ActionType<Pick<typeof actions,
  'updateAvailable' | 'retiredBookRedirect'
>>
  | AppMessageNotification;

export interface ToastNotification extends ToastMeta {
  messageKey: string;
  timestamp: number;
  shouldAutoDismiss: boolean;
  variant?: ToastVariant;
}

export interface ToastMeta {
  destination: 'studyGuides' | 'myHighlights' | 'page';
  shouldAutoDismiss?: boolean;
  errorId?: string;
  variant?: ToastVariant;
}

export type AnyNotification = ModalNotification | ToastNotification;

export interface State {
  modalNotifications: ModalNotification[];
  toastNotifications: ToastNotification[];
}
