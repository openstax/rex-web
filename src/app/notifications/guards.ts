import { appMessageType } from './reducer';
import { AnyNotification, AppMessageNotification, ModalNotification, ToastNotification } from './types';

export const isToastNotification = (message: AnyNotification): message is ToastNotification =>
  'timestamp' in message;

export const isModalNotification = (message: AnyNotification): message is ModalNotification =>
  !isToastNotification(message);

export const isAppMessage = (message: AnyNotification): message is AppMessageNotification =>
  isModalNotification(message) && message.type === appMessageType;
