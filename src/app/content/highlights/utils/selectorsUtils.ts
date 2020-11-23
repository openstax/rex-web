import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import flow from 'lodash/fp/flow';
import mapValues from 'lodash/fp/mapValues';
import merge from 'lodash/fp/merge';
import omit from 'lodash/fp/omit';
import reduce from 'lodash/fp/reduce';
import size from 'lodash/fp/size';
import values from 'lodash/fp/values';
import { assertDefined } from '../../../utils';
import { LocationFilters } from '../../components/popUp/types';
import {
  CountsPerSource,
  SummaryHighlights,
  SummaryHighlightsPagination
} from '../types';
import {
  filterCountsPerSourceByColorFilter,
  filterCountsPerSourceByLocationFilter
} from './paginationUtils';

export const filterCounts = (
  totalCounts: CountsPerSource,
  locationFilters: LocationFilters,
  colorFilters: Set<HighlightColorEnum>
) => {
  return flow(
    (counts) => filterCountsPerSourceByLocationFilter(locationFilters, counts),
    (counts) => filterCountsPerSourceByColorFilter([...colorFilters], counts)
  )(totalCounts);
};

export const getSelectedHighlightsLocationFilters = (
  locationFilters: LocationFilters,
  selectedIds: Set<string>
  ) => [...selectedIds].reduce((result, selectedId) =>
  result.set(selectedId, assertDefined(locationFilters.get(selectedId), 'location filter id not found'))
, new Map() as LocationFilters);

export const getLoadedCountsPerSource = (sources: SummaryHighlights | null) => flow(
  values,
  reduce(merge, {}),
  mapValues(size)
)(sources);

export const checkIfHasMoreResults = (loaded: any, filteredCounts: any, pagination: SummaryHighlightsPagination) => {
  return !!(pagination || Object.keys(omit(Object.keys(loaded), filteredCounts)).length);
};
