import { HighlightUpdate } from '@openstax/highlighter/dist/api';
import Sentry from '../../../../helpers/Sentry';
import { addToast } from '../../../notifications/actions';
import { ActionHookBody } from '../../../types';
import { actionHook, assertDefined } from '../../../utils';
import { updateHighlight } from '../actions';
import { localState as highlightsLocalState } from '../selectors';
import { findHighlight } from '../utils/reducerUtils';

export const hookBody: ActionHookBody<typeof updateHighlight> =
  ({highlightClient, getState, dispatch}) => ({payload, meta}) => {
    if (meta.revertingAfterFailure) { return; }

    const oldHighlight = assertDefined(
      findHighlight(highlightsLocalState(getState()), payload.id), 'Can\'t update a highlight that doesn\'t exist'
    );

    const oldColor = oldHighlight.color as unknown as HighlightUpdate['color'];
    const oldAnnotation = oldHighlight.annotation;

    highlightClient.updateHighlight(payload).catch((error) => {
      Sentry.captureException(error);

      if (oldColor === payload.highlight.color && oldAnnotation === payload.highlight.annotation) { return; }

      if (oldColor !== payload.highlight.color) {
        dispatch(addToast('i18n:notification:toast:highlights:update-failure:color'));
      } else {
        dispatch(addToast('i18n:notification:toast:highlights:update-failure:annotation'));
      }

      dispatch(updateHighlight(
        {
          highlight: {
            ...oldHighlight,
            color: oldColor,
          },
          id: payload.id,
        },
        {...meta, revertingAfterFailure: true}
      ));
    });
  };

export default actionHook(updateHighlight, hookBody);
