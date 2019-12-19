import { AppServices, MiddlewareAPI,  } from '../../../types';
import { page as pageSelector } from '../../selectors';
import { stripIdVersion } from '../../utils/idUtils';
import { setSummaryFilters } from '../actions';
import * as select from '../selectors';
import { getHighlightLocationForPage } from '../utils';

const addCurrentPageToSummaryFilters = ({
  dispatch, getState,
}: MiddlewareAPI & AppServices) => {
  const state = getState();
  const page = pageSelector(state);
  const locations = select.highlightLocations(state);
  const filters = select.summaryFilters(state);
  if (!locations.size || !page || typeof(window) === 'undefined') {
    return;
  }

  const chapterToAdd = getHighlightLocationForPage(locations, page);
  const idToAdd = chapterToAdd ? stripIdVersion(chapterToAdd.id) : null;

  if (idToAdd && !filters.locationIds.includes(idToAdd)) {
    dispatch(setSummaryFilters({
      ...filters,
      locationIds: [...filters.locationIds, idToAdd],
    }));
  }
};

export default addCurrentPageToSummaryFilters;
