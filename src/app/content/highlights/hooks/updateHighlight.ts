import Sentry from '../../../../helpers/Sentry';
import { addToast } from '../../../notifications/actions';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { getHighlightToastDesination } from '../../../notifications/utils';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { updateHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof updateHighlight> =
  ({highlightClient, dispatch, getState}) => async({payload, meta}) => {
    if (meta.revertingAfterFailure) { return; }

    const destination = getHighlightToastDesination(getState());

    try {
      await highlightClient.updateHighlight(payload);
    } catch (error) {
      Sentry.captureException(error);

      const oldColor = meta.preUpdateData.highlight.color;
      const oldAnnotation = meta.preUpdateData.highlight.annotation;

      if (oldColor === payload.highlight.color && oldAnnotation === payload.highlight.annotation) { return; }

      if (oldColor !== payload.highlight.color) {
        dispatch(addToast(toastMessageKeys.higlights.failure.update.color, {destination}));
      } else {
        dispatch(addToast(toastMessageKeys.higlights.failure.update.annotation, {destination}));
      }

      dispatch(updateHighlight(meta.preUpdateData, {...meta, revertingAfterFailure: true}));
    }
  };

export default actionHook(updateHighlight, hookBody);
