import { makeToastMessageError } from '../../../helpers/applicationMessageError';
import { toastMessageKeys } from '../../notifications/components/ToastNotifications/constants';

export const HighlightCreateError = makeToastMessageError(toastMessageKeys.highlights.failure.create);

export const HighlightDeleteError = makeToastMessageError(toastMessageKeys.highlights.failure.delete);

export const HighlightLoadError = makeToastMessageError(toastMessageKeys.highlights.failure.load);

export const HighlightPopupLoadError = makeToastMessageError(toastMessageKeys.highlights.failure.popUp.load);

export const HighlightPopupPrintError = makeToastMessageError(toastMessageKeys.highlights.failure.popUp.print);

export const HighlightUpdateAnnotationError = makeToastMessageError(
  toastMessageKeys.highlights.failure.update.annotation);

export const HighlightUpdateColorError = makeToastMessageError(toastMessageKeys.highlights.failure.update.color);

export const StudyGuidesLoadError = makeToastMessageError(toastMessageKeys.studyGuides.failure.load);

export const StudyGuidesPopupLoadError = makeToastMessageError(toastMessageKeys.studyGuides.failure.popUp.load);

export const StudyGuidesPopupPrintError = makeToastMessageError(toastMessageKeys.studyGuides.failure.popUp.print);
