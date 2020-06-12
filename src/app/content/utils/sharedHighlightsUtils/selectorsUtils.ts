import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import flow from 'lodash/fp/flow';
import { assertDefined } from '../../../utils';
import {
  filterCountsPerSourceByColorFilter,
  filterCountsPerSourceByLocationFilter
} from '../../highlights/utils/paginationUtils';
import { CountsPerSource, HighlightLocationFilters } from '../../types';

export const filterCounts = (
  totalCounts: CountsPerSource,
  locationFilters: HighlightLocationFilters,
  colorFilters: Set<HighlightColorEnum>
) => {
  return flow(
    (counts) => filterCountsPerSourceByLocationFilter(locationFilters, counts),
    (counts) => filterCountsPerSourceByColorFilter([...colorFilters], counts)
  )(totalCounts);
};

export const getSelectedHighlightsLocationFilters = (
  locationFilters: HighlightLocationFilters,
  selectedIds: Set<string>
  ) => [...selectedIds].reduce((result, selectedId) =>
  result.set(selectedId, assertDefined(locationFilters.get(selectedId), 'location filter id not found'))
, new Map() as HighlightLocationFilters);

