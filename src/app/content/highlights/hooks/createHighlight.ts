import { HighlightColorEnum, HighlightSourceTypeEnum } from '@openstax/highlighter/dist/api';
import Sentry from '../../../../helpers/Sentry';
import { addToast } from '../../../notifications/actions';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { getHighlightToastDesination } from '../../../notifications/utils';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { createHighlight, receiveDeleteHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof createHighlight> = ({highlightClient, analytics, dispatch, getState}) => {
  const trackCreate = analytics.createNote.bind(getState);

  return async({payload, meta}) => {
    if (meta.revertingAfterFailure) { return; }

    const destination = getHighlightToastDesination(getState());

    trackCreate(payload, meta);

    try {
      await highlightClient.addHighlight({highlight: payload});
    } catch (error) {
      Sentry.captureException(error);

      dispatch(addToast(toastMessageKeys.higlights.failure.create, {destination}));
      dispatch(receiveDeleteHighlight({
        ...payload,
        color: payload.color as unknown as HighlightColorEnum,
        sourceType: payload.sourceType as unknown as HighlightSourceTypeEnum,
      }, {...meta, revertingAfterFailure: true}));
    }
  };
};

export default actionHook(createHighlight, hookBody);
