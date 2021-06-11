import { replace } from '../../../navigation/actions';
import * as navigation from '../../../navigation/selectors';
import { getQueryForParam } from '../../../navigation/utils';
import { ActionHookBody } from '../../../types';
import { colorFilterQueryParameterName } from '../../constants';
import updateSummaryFilters from '../../highlights/utils/updateSummaryFilters';
import { updateSummaryFilters as updateSummaryFiltersAction } from '../actions';
import { summaryFilters } from '../selectors';

export const hookBody: ActionHookBody<typeof updateSummaryFiltersAction> = (services) => (action) => {
  const state = services.getState();
  const existingQuery = navigation.query(state);
  const match = navigation.match(state);
  const filters = summaryFilters(state);

  if (match && action.payload.colors) {
    const updatedFilters = updateSummaryFilters(filters, action.payload);
    services.dispatch(replace(match, {
      search: getQueryForParam(colorFilterQueryParameterName, updatedFilters.colors, existingQuery),
    }));
  }
};
