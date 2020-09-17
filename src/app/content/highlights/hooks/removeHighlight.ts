import { NewHighlight } from '@openstax/highlighter/dist/api';
import Sentry from '../../../../helpers/Sentry';
import { addToast } from '../../../notifications/actions';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { createHighlight, deleteHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof deleteHighlight> =
  ({highlightClient, dispatch}) => async({meta, payload}) => {
    if (meta.revertingAfterFailure) { return; }

    try {
      await highlightClient.deleteHighlight({id: payload.id});
    } catch (error) {
      Sentry.captureException(error);

      dispatch(addToast({messageKey: 'i18n:notification:toast:highlights:delete-failure'}));
      dispatch(createHighlight({
        ...payload as unknown as NewHighlight,
        id: payload.id,
      },
      {...meta, revertingAfterFailure: true}));
    }
  };

export default actionHook(deleteHighlight, hookBody);
