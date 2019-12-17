import { ActionHookBody, AppServices, MiddlewareAPI,  } from '../../../types';
import { actionHook } from '../../../utils';
import { bookAndPage, bookSections } from '../../selectors';
import { archiveTreeSectionIsChapter, findArchiveTreeNode } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { addCurrentPageToSummaryFilters, setSummaryFilters } from '../actions';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof addCurrentPageToSummaryFilters> = ({
  dispatch, getState,
}: MiddlewareAPI & AppServices) => async() => {
  const state = getState();
  const {book, page} = bookAndPage(state);
  const sections = bookSections(state);
  const filters = select.summaryFilters(state);
  if (!book || !page || typeof(window) === 'undefined') {
    return;
  }

  let idToAdd = sections.has(page.id) ? stripIdVersion(sections.get(page.id)!.id) : null;

  if (!idToAdd) {
    for (const section of sections.values()) {
      if (archiveTreeSectionIsChapter(section) && findArchiveTreeNode(section, page.id)) {
        idToAdd = stripIdVersion(section.id);
        break;
      }
    }
  }

  if (idToAdd && !filters.chapters.includes(idToAdd)) {
    dispatch(setSummaryFilters({
      ...filters,
      chapters: [...filters.chapters, idToAdd],
    }));
  }
};

export default actionHook(addCurrentPageToSummaryFilters, hookBody);
