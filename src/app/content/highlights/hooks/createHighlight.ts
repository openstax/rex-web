import { Highlight } from '@openstax/highlighter/dist/api';
import Sentry from '../../../../helpers/Sentry';
import { addToast } from '../../../notifications/actions';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { getHighlightToastDesination } from '../../../notifications/utils';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { createHighlight, receiveDeleteHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof createHighlight> =
  ({highlightClient, dispatch, getState}) => async({payload, meta}) => {
    if (meta.revertingAfterFailure) { return; }

    const destination = getHighlightToastDesination(getState());

    try {
      await highlightClient.addHighlight({highlight: payload});
    } catch (error) {
      Sentry.captureException(error);

      dispatch(addToast(toastMessageKeys.higlights.failure.create, {destination}));
      dispatch(receiveDeleteHighlight(payload as unknown as Highlight, {...meta, revertingAfterFailure: true}));
    }
  };

export default actionHook(createHighlight, hookBody);
