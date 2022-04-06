import { HighlightColorEnum } from '@openstax/highlights-client';
import { OutputParams } from 'query-string';
import { replace } from '../../navigation/actions';
import * as navigation from '../../navigation/selectors';
import { getQueryForParam } from '../../navigation/utils';
import { AppState, Dispatch } from '../../types';
import { colorFilterQueryParameterName, locationIdsFilterQueryParameterName } from '../constants';
import { SummaryFiltersUpdate } from '../highlights/types';
import updateSummaryFilters from '../highlights/utils/updateSummaryFilters';
import { colorfilterLabels } from './constants';
import * as selectors from './selectors';

export const getFiltersFromQuery = (query: OutputParams) => {
  const queryColors = query[colorFilterQueryParameterName] as HighlightColorEnum | HighlightColorEnum[] | undefined;
  const queryLocationIds = query[locationIdsFilterQueryParameterName] as string | string[] | undefined;

  const colorsArray = colorFilterQueryParameterName in query
    ? (Array.isArray(queryColors) ? queryColors : [queryColors])
    : null;
  const colors = colorsArray?.filter((color) => color && colorfilterLabels.has(color)) as HighlightColorEnum[];

  const locationsArray = locationIdsFilterQueryParameterName in query
    ? (Array.isArray(queryLocationIds) ? queryLocationIds : [queryLocationIds])
    : null;

  const locationIds = locationsArray?.filter((id) => id) as string[];

  return { colors, locationIds };
};

export const updateQueryFromFilterChange = (dispatch: Dispatch, state: AppState, change: SummaryFiltersUpdate) => {
  // this only happens on change
  const updatedFilters = updateSummaryFilters(selectors.summaryFilters(state), change);
  const filtersCopy = updatedFilters as {[key: string]: any};
  for (const filter in updatedFilters) {
    if (filtersCopy[filter] && !filtersCopy[filter].length) {
      filtersCopy[filter] = null;
    }
  }
  const match = navigation.match(state);
  const existingQuery = navigation.query(state);
  if (!match ) { return; }
  dispatch(replace(match, {
    search: getQueryForParam(filtersCopy as any as Record<string, string[]>, existingQuery),
  }));
};
