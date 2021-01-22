import { makeApplicationError } from '../../../../helpers/applicationMessageError';
import { getHighlightToastDesination } from '../../../notifications/utils';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { updateHighlight } from '../actions';
import { HighlightUpdateAnnotationError, HighlightUpdateColorError } from '../errors';

export const hookBody: ActionHookBody<typeof updateHighlight> =
  ({highlightClient, dispatch, getState}) => async({payload, meta}) => {
    if (meta.revertingAfterFailure) { return; }

    const destination = getHighlightToastDesination(getState());

    try {
      await highlightClient.updateHighlight(payload);
    } catch (error) {
      const oldColor = meta.preUpdateData.highlight.color;
      const oldAnnotation = meta.preUpdateData.highlight.annotation;

      if (oldColor === payload.highlight.color && oldAnnotation === payload.highlight.annotation) { return; }

      dispatch(updateHighlight(meta.preUpdateData, {...meta, revertingAfterFailure: true}));

      throw makeApplicationError(
        error,
        () => payload.highlight.color && oldColor !== payload.highlight.color
          ? new HighlightUpdateColorError({ destination })
          : new HighlightUpdateAnnotationError({ destination })
      );
    }
  };

export default actionHook(updateHighlight, hookBody);
