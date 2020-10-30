import { loggedOut } from '../../../auth/selectors';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import * as selectContent from '../../selectors';
import { archiveTreeSectionIsChapter, findArchiveTreeNode } from '../../utils/archiveTreeUtils';
import { loadMoreStudyGuides, openStudyGuides, setDefaultSummaryFilters } from '../actions';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof openStudyGuides> = (services) => async() => {
  const state = services.getState();
  const filtersHaveBeenSet = select.filtersHaveBeenSet(state);
  const currentFilters = select.summaryLocationFilters(state);
  const defaultFilter = select.defaultLocationFilter(state);
  const notLoggedIn = loggedOut(state);
  const book = selectContent.book(state);
  const firstChapter = book && findArchiveTreeNode(archiveTreeSectionIsChapter, book.tree);

  if (notLoggedIn && firstChapter && !currentFilters.has(firstChapter.id)) {
    services.dispatch(setDefaultSummaryFilters({ locationIds: [firstChapter.id] }));
  } else if (!notLoggedIn && !filtersHaveBeenSet && defaultFilter && !currentFilters.has(defaultFilter.id)) {
    services.dispatch(setDefaultSummaryFilters({locationIds: [defaultFilter.id]}));
  } else {
    const studyGuides = select.summaryStudyGuides(state);
    const studyGuidesAreLoading = select.summaryIsLoading(state);

    if (studyGuides === null && studyGuidesAreLoading === false) {
      services.dispatch(loadMoreStudyGuides());
    }
  }
};

export const openStudyGuidesHook = actionHook(openStudyGuides, hookBody);
