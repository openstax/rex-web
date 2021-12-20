import { replace } from '../../../navigation/actions';
import * as navigation from '../../../navigation/selectors';
import { AnyMatch } from '../../../navigation/types';
import { updateQuery } from '../../../navigation/utils';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { loadMoreStudyGuides, openStudyGuides } from '../actions';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof openStudyGuides> = (services) => async() => {
  const state = services.getState();
  const query = navigation.query(state);
  const match = navigation.match(state);
  const loggedOutAndQueryMissingFirstChapter = select.loggedOutAndQueryMissingFirstChapter(state);
  const loggedInAndQueryMissingLocationIds = select.loggedInAndQueryMissingLocationIds(state);
  const summaryFilters = select.summaryFilters(state);

  if (loggedOutAndQueryMissingFirstChapter || loggedInAndQueryMissingLocationIds) {
    services.dispatch(replace(match as AnyMatch, {
      search: updateQuery(summaryFilters as any as Record<string, string[]>, query),
    }));
  } else {
    const studyGuides = select.summaryStudyGuides(state);
    const studyGuidesAreLoading = select.summaryIsLoading(state);

    if (studyGuides === null && studyGuidesAreLoading === false) {
      services.dispatch(loadMoreStudyGuides());
    }
  }
};

export const openStudyGuidesHook = actionHook(openStudyGuides, hookBody);
