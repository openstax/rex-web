import { AppServices, MiddlewareAPI,  } from '../../../types';
import { bookSections, page as pageSelector } from '../../selectors';
import { getCurrentChapter } from '../../utils';
import { stripIdVersion } from '../../utils/idUtils';
import { setSummaryFilters } from '../actions';
import * as select from '../selectors';

export const addCurrentPageToSummaryFilters = ({
  dispatch, getState,
}: MiddlewareAPI & AppServices) => {
  console.log('hello')
  const state = getState();
  const page = pageSelector(state);
  const sections = bookSections(state);
  const filters = select.summaryFilters(state);
  console.log('sections.size ', sections.size, page )
  if (!sections.size || !page || typeof(window) === 'undefined') {
    return;
  }
  console.log('hello2')

  const chapterToAdd = getCurrentChapter(sections, page);
  const idToAdd = chapterToAdd ? stripIdVersion(chapterToAdd.id) : null;
  console.log('hello3', idToAdd)

  if (idToAdd && !filters.chapters.includes(idToAdd)) {
    console.log('hello4')
    dispatch(setSummaryFilters({
      ...filters,
      chapters: [...filters.chapters, idToAdd],
    }));
  }
};

export default addCurrentPageToSummaryFilters;
