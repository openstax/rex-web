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

  const colors = (Array.isArray(queryColors) ? queryColors : [queryColors])
    .filter((color) => color && colorfilterLabels.has(color)) as HighlightColorEnum[];

  const locationIds = (Array.isArray(queryLocationIds) ? queryLocationIds : [queryLocationIds])
    .filter((id) => id) as string[];

  return { colors, locationIds };
};

export const updateQueryFromFilterChange = (dispatch: Dispatch, state: AppState, change: SummaryFiltersUpdate) => {
  const updatedFilters = updateSummaryFilters(selectors.summaryFilters(state), change);
  const match = navigation.match(state);
  const existingQuery = navigation.query(state);
  if (!match ) { return; }
  dispatch(replace(match, {
    search: getQueryForParam(updatedFilters as any as Record<string, string[]>, existingQuery),
  }));
};
