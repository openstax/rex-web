import { makeToastMessageError } from '../../../helpers/applicationMessageError';
import { toastMessageKeys } from '../../notifications/components/ToastNotifications/constants';

// tslint:disable-next-line: variable-name
export const HighlightCreateError = makeToastMessageError(toastMessageKeys.highlights.failure.create);

// tslint:disable-next-line: variable-name
export const HighlightDeleteError = makeToastMessageError(toastMessageKeys.highlights.failure.delete);

// tslint:disable-next-line: variable-name
export const HighlightLoadError = makeToastMessageError(toastMessageKeys.highlights.failure.load);

// tslint:disable-next-line: variable-name
export const HighlightPopupLoadError = makeToastMessageError(toastMessageKeys.highlights.failure.popUp.load);

// tslint:disable-next-line: variable-name
export const HighlightPopupPrintError = makeToastMessageError(toastMessageKeys.highlights.failure.popUp.print);

// tslint:disable-next-line: variable-name
export const HighlightUpdateAnnotationError = makeToastMessageError(
  toastMessageKeys.highlights.failure.update.annotation);

// tslint:disable-next-line: variable-name
export const HighlightUpdateColorError = makeToastMessageError(toastMessageKeys.highlights.failure.update.color);

// tslint:disable-next-line: variable-name
export const StudyGuidesLoadError = makeToastMessageError(toastMessageKeys.studyGuides.failure.load);

// tslint:disable-next-line: variable-name
export const StudyGuidesPopupLoadError = makeToastMessageError(toastMessageKeys.studyGuides.failure.popUp.load);

// tslint:disable-next-line: variable-name
export const StudyGuidesPopupPrintError = makeToastMessageError(toastMessageKeys.studyGuides.failure.popUp.print);
