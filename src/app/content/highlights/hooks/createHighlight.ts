import { HighlightColorEnum, HighlightSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { ensureApplicationErrorType } from '../../../../helpers/applicationMessageError';
import { getHighlightToastDesination } from '../../../notifications/utils';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { createHighlight, receiveDeleteHighlight } from '../actions';
import { HighlightCreateError } from '../errors';

export const hookBody: ActionHookBody<typeof createHighlight> = ({highlightClient, analytics, dispatch, getState}) => {
  const trackCreate = analytics.createNote.bind(getState);

  return async({payload, meta}) => {
    if (meta.revertingAfterFailure) { return; }

    const destination = getHighlightToastDesination(getState());

    trackCreate(payload, meta);

    try {
      await highlightClient.addHighlight({highlight: payload});
    } catch (error) {
      dispatch(receiveDeleteHighlight({
        ...payload,
        color: payload.color as unknown as HighlightColorEnum,
        sourceType: payload.sourceType as unknown as HighlightSourceTypeEnum,
      }, {...meta, revertingAfterFailure: true}));
      throw ensureApplicationErrorType(error, new HighlightCreateError({ destination }));
    }
  };
};

export default actionHook(createHighlight, hookBody);
