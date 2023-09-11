import { makeToastMessageError } from '../../../helpers/applicationMessageError';
import { toastMessageKeys } from '../../notifications/components/ToastNotifications/constants';

// tslint:disable-next-line: variable-name
export const SearchLoadError = makeToastMessageError(toastMessageKeys.search.failure.load);
