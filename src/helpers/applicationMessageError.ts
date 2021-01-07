import { ToastMeta } from '../app/notifications/types';

export class ApplicationMesssageError extends Error {
  public messageKey: string;
  public meta: ToastMeta;

  constructor(messageKey: string, meta: ToastMeta) {
    super();
    this.messageKey = messageKey;
    this.meta = meta;
  }
}

// tslint:disable-next-line: max-classes-per-file
export const makeApplicationError = (messageKey: string) => class extends ApplicationMesssageError {
  constructor(meta: ToastMeta) {
    super(messageKey, meta);
  }
};
