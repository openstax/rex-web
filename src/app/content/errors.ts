import { makeToastMessageError } from '../../helpers/applicationMessageError';
import { toastMessageKeys } from '../notifications/components/ToastNotifications/constants';

export const ArchiveLoadError = makeToastMessageError(toastMessageKeys.archive.failure.load);
