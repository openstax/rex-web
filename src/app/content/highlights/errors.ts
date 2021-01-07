import { makeApplicationError } from '../../../helpers/applicationMessageError';
import { toastMessageKeys } from '../../notifications/components/ToastNotifications/constants';

// tslint:disable-next-line: variable-name
export const HighlightCreateError = makeApplicationError(toastMessageKeys.higlights.failure.create);

// tslint:disable-next-line: variable-name
export const HighlightDeleteError = makeApplicationError(toastMessageKeys.higlights.failure.delete);

// tslint:disable-next-line: variable-name
export const HighlightLoadError = makeApplicationError(toastMessageKeys.higlights.failure.load);

// tslint:disable-next-line: variable-name
export const HighlightPopupLoadError = makeApplicationError(toastMessageKeys.higlights.failure.popUp.load);

// tslint:disable-next-line: variable-name
export const HighlightPopupPrintError = makeApplicationError(toastMessageKeys.higlights.failure.popUp.print);

// tslint:disable-next-line: variable-name
export const HighlightUpdateAnnotationError = makeApplicationError(
  toastMessageKeys.higlights.failure.update.annotation);

// tslint:disable-next-line: variable-name
export const HighlightUpdateColorError = makeApplicationError(toastMessageKeys.higlights.failure.update.color);

// tslint:disable-next-line: variable-name
export const StudyGuidesLoadError = makeApplicationError(toastMessageKeys.studyGuides.failure.load);

// tslint:disable-next-line: variable-name
export const StudyGuidesPopupLoadError = makeApplicationError(toastMessageKeys.studyGuides.failure.popUp.load);

// tslint:disable-next-line: variable-name
export const StudyGuidesPopupPrintError = makeApplicationError(toastMessageKeys.studyGuides.failure.popUp.print);
