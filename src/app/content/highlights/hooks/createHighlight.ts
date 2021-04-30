import { Highlight } from '@openstax/highlighter/dist/api';
import { ensureApplicationErrorType } from '../../../../helpers/applicationMessageError';
import { getHighlightToastDesination } from '../../../notifications/utils';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { createHighlight, receiveDeleteHighlight } from '../actions';
import { HighlightCreateError } from '../errors';

export const hookBody: ActionHookBody<typeof createHighlight> =
  ({highlightClient, dispatch, getState}) => async({payload, meta}) => {
    if (meta.revertingAfterFailure) { return; }

    const destination = getHighlightToastDesination(getState());

    console.log(payload);
    try {
      await highlightClient.addHighlight({highlight: payload});
    } catch (error) {
      dispatch(receiveDeleteHighlight(payload as unknown as Highlight, {...meta, revertingAfterFailure: true}));
      throw ensureApplicationErrorType(error, new HighlightCreateError({ destination }));
    }
  };

export default actionHook(createHighlight, hookBody);
