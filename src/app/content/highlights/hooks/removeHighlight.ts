import { NewHighlight } from '@openstax/highlighter/dist/api';
import Sentry from '../../../../helpers/Sentry';
import { addToast } from '../../../notifications/actions';
import { ActionHookBody } from '../../../types';
import { actionHook, assertDefined } from '../../../utils';
import { createHighlight, deleteHighlight } from '../actions';
import { localState as highlightsLocalState } from '../selectors';
import { findHighlight } from '../utils/reducerUtils';

export const hookBody: ActionHookBody<typeof deleteHighlight> =
  ({highlightClient, dispatch, getState}) => ({meta, payload}) => {
    if (meta.failedToSave) { return; }

    const oldHighlight = assertDefined(
      findHighlight(highlightsLocalState(getState()), payload), 'Can\'t remove a highlight that doesn\'t exist'
    );

    highlightClient.deleteHighlight({id: payload}).catch((err) => {
      Sentry.captureException(err);

      dispatch(addToast('i18n:notification:toast:highlights:failure'));
      dispatch(createHighlight({
        ...oldHighlight,
        color: oldHighlight.color as unknown as NewHighlight['color'],
        id: payload,
        sourceType: oldHighlight.sourceType as unknown as NewHighlight['sourceType'],
      },
      {...meta, failedToSave: true}));
    });
  };

export default actionHook(deleteHighlight, hookBody);
