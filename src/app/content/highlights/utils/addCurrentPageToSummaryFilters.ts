import { AppServices, MiddlewareAPI,  } from '../../../types';
import { page as pageSelector } from '../../selectors';
import { stripIdVersion } from '../../utils/idUtils';
import { setSummaryFilters } from '../actions';
import * as select from '../selectors';
import { getHighlightLocationFilterForPage } from '../utils';

const addCurrentPageToSummaryFilters = ({
  dispatch, getState,
}: MiddlewareAPI & AppServices) => {
  const state = getState();
  const page = pageSelector(state);
  const locationFilters = select.highlightLocationFilters(state);
  const filters = select.summaryFilters(state);
  if (!locationFilters.size || !page || typeof(window) === 'undefined') {
    return;
  }

  const locationToAdd = getHighlightLocationFilterForPage(locationFilters, page);
  const idToAdd = locationToAdd ? stripIdVersion(locationToAdd.id) : null;

  if (idToAdd && !filters.locationIds.includes(idToAdd)) {
    dispatch(setSummaryFilters({
      locationIds: [...filters.locationIds, idToAdd],
    }));
  }
};

export default addCurrentPageToSummaryFilters;
