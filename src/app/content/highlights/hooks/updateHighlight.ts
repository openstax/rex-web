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
    if (meta.failedToSave) { return; }

    const oldHighlight = assertDefined(
      findHighlight(highlightsLocalState(getState()), payload.id), 'Can\'t update a highlight that doesn\'t exist'
    );

    highlightClient.updateHighlight(payload).catch((error) => {
      Sentry.captureException(error);

      dispatch(addToast('i18n:notification:toast:highlights:failure'));
      dispatch(updateHighlight(
        {
          highlight: {
            ...oldHighlight,
            color: oldHighlight.color as unknown as HighlightUpdate['color'],
          },
          id: payload.id,
        },
        {...meta, failedToSave: true}
      ));
    });
  };

export default actionHook(updateHighlight, hookBody);
