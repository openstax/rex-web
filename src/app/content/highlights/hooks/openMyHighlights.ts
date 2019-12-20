import { ActionHookBody, AppServices, MiddlewareAPI } from '../../../types';
import { actionHook } from '../../../utils';
import { openMyHighlights } from '../actions';
import { addCurrentPageToSummaryFilters } from '../utils';

export const hookBody: ActionHookBody<typeof openMyHighlights> = (
  services: MiddlewareAPI & AppServices
) => () => {
  addCurrentPageToSummaryFilters(services);
};

export default actionHook(openMyHighlights, hookBody);
