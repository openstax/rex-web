import { ToastMeta } from '../app/notifications/types';

export class ApplicationError extends Error {}

// tslint:disable-next-line: max-classes-per-file
export class ToastMesssageError extends Error {
  public messageKey: string;
  public meta: ToastMeta;

  constructor(messageKey: string, meta: ToastMeta) {
    super();
    this.messageKey = messageKey;
    this.meta = meta;
  }
}

// tslint:disable-next-line: max-classes-per-file
export const makeToastMessageError = (messageKey: string) => class extends ToastMesssageError {
  constructor(meta: ToastMeta) {
    super(messageKey, meta);
  }
};

/**
 * Return @param error if it is instance of ApplicationError or @param customError in other cases
 */
export const ensureApplicationErrorType = (error: unknown, customError: Error | (() => Error)) => {
  if (error instanceof ApplicationError) {
    return error;
  }
  return typeof customError === 'function' ? customError() : customError;
};
