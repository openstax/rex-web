import { makeToastMessageError } from '../../helpers/applicationMessageError';
import { toastMessageKeys } from '../notifications/components/ToastNotifications/constants';

// tslint:disable-next-line: variable-name
export const ArchiveLoadError = makeToastMessageError(toastMessageKeys.archive.failure.load);
