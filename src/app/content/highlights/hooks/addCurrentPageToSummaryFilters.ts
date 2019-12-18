import { AppServices, MiddlewareAPI,  } from '../../../types';
import { bookSections, page as pageSelector } from '../../selectors';
import { getCurrentChapter } from '../../utils';
import { stripIdVersion } from '../../utils/idUtils';
import { setSummaryFilters } from '../actions';
import * as select from '../selectors';

export const addCurrentPageToSummaryFilters = ({
  dispatch, getState,
}: MiddlewareAPI & AppServices) => {
  const state = getState();
  const page = pageSelector(state);
  const sections = bookSections(state);
  const filters = select.summaryFilters(state);
  if (!sections.size || !page || typeof(window) === 'undefined') {
    return;
  }

  const chapterToAdd = getCurrentChapter(sections, page);
  const idToAdd = chapterToAdd ? stripIdVersion(chapterToAdd.id) : null;

  if (idToAdd && !filters.chapters.includes(idToAdd)) {
    dispatch(setSummaryFilters({
      ...filters,
      chapters: [...filters.chapters, idToAdd],
    }));
  }
};

export default addCurrentPageToSummaryFilters;
