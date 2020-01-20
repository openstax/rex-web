import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { receiveHighlightsTotalCounts, setSummaryFilters } from '../actions';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof receiveHighlightsTotalCounts> = ({
  dispatch, getState,
}) => async() => {
  const state = getState();
  const totalCounts = select.totalCountsPerPage(state);
  const locationFiltersWithContent = select.highlightLocationFiltersWithContent(state);

  if (!totalCounts) {
    return;
  }

  dispatch(setSummaryFilters({ locationIds: Array.from(locationFiltersWithContent) }));
};

export default actionHook(receiveHighlightsTotalCounts, hookBody);
