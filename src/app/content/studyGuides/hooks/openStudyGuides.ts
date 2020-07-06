import { loggedOut } from '../../../auth/selectors';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { loadMoreStudyGuides, openStudyGuides, setDefaultSummaryFilters } from '../actions';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof openStudyGuides> = (services) => async() => {
  const state = services.getState();
  const filtersHaveBeenSet = select.filtersHaveBeenSet(state);
  const currentFilters = select.summaryLocationFilters(state);
  const defaultFilter = select.defaultLocationFilter(state);
  const notLoggedIn = loggedOut(state);
  const locationFilters = select.studyGuidesLocationFiltersWithContent(state);
  const firstChapter = Array.from(locationFilters)[0];

  if (notLoggedIn && firstChapter && !currentFilters.has(firstChapter)) {
    services.dispatch(setDefaultSummaryFilters({ locationIds: [firstChapter] }));
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
