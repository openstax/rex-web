import Sentry from '../../../../helpers/Sentry';
import { addToast } from '../../../notifications/actions';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { updateHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof updateHighlight> =
  ({highlightClient, dispatch}) => async({payload, meta}) => {
    if (meta.revertingAfterFailure) { return; }

    try {
      await highlightClient.updateHighlight(payload);
    } catch (error) {
      Sentry.captureException(error);

      const oldColor = meta.preUpdateData.highlight.color;
      const oldAnnotation = meta.preUpdateData.highlight.annotation;

      if (oldColor === payload.highlight.color && oldAnnotation === payload.highlight.annotation) { return; }

      if (oldColor !== payload.highlight.color) {
        dispatch(addToast({messageKey: 'i18n:notification:toast:highlights:update-failure:color'}));
      } else {
        dispatch(addToast({messageKey: 'i18n:notification:toast:highlights:update-failure:annotation'}));
      }

      dispatch(updateHighlight(meta.preUpdateData, {...meta, revertingAfterFailure: true}));
    }
  };

export default actionHook(updateHighlight, hookBody);
