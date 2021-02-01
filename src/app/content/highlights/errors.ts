import { makeToastMessageError } from '../../../helpers/applicationMessageError';
import { toastMessageKeys } from '../../notifications/components/ToastNotifications/constants';

// tslint:disable-next-line: variable-name
export const HighlightCreateError = makeToastMessageError(toastMessageKeys.higlights.failure.create);

// tslint:disable-next-line: variable-name
export const HighlightDeleteError = makeToastMessageError(toastMessageKeys.higlights.failure.delete);

// tslint:disable-next-line: variable-name
export const HighlightLoadError = makeToastMessageError(toastMessageKeys.higlights.failure.load);

// tslint:disable-next-line: variable-name
export const HighlightPopupLoadError = makeToastMessageError(toastMessageKeys.higlights.failure.popUp.load);

// tslint:disable-next-line: variable-name
export const HighlightPopupPrintError = makeToastMessageError(toastMessageKeys.higlights.failure.popUp.print);

// tslint:disable-next-line: variable-name
export const HighlightUpdateAnnotationError = makeToastMessageError(
  toastMessageKeys.higlights.failure.update.annotation);

// tslint:disable-next-line: variable-name
export const HighlightUpdateColorError = makeToastMessageError(toastMessageKeys.higlights.failure.update.color);

// tslint:disable-next-line: variable-name
export const StudyGuidesLoadError = makeToastMessageError(toastMessageKeys.studyGuides.failure.load);

// tslint:disable-next-line: variable-name
export const StudyGuidesPopupLoadError = makeToastMessageError(toastMessageKeys.studyGuides.failure.popUp.load);

// tslint:disable-next-line: variable-name
export const StudyGuidesPopupPrintError = makeToastMessageError(toastMessageKeys.studyGuides.failure.popUp.print);
