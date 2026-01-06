import { makeToastMessageError } from '../../../helpers/applicationMessageError';
import { toastMessageKeys } from '../../notifications/components/ToastNotifications/constants';

export const SearchLoadError = makeToastMessageError(toastMessageKeys.search.failure.load);
