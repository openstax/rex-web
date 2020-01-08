import { user } from '../../../auth/selectors';
import { ActionHookBody, AppServices, MiddlewareAPI } from '../../../types';
import { actionHook } from '../../../utils';
import { openMyHighlights } from '../actions';
import { addCurrentPageToSummaryFilters } from '../utils';

export const hookBody: ActionHookBody<typeof openMyHighlights> = (
  services: MiddlewareAPI & AppServices
) => () => {
  const authenticated = user(services.getState());

  if (!authenticated) { return; }

  addCurrentPageToSummaryFilters(services);
};

export default actionHook(openMyHighlights, hookBody);
