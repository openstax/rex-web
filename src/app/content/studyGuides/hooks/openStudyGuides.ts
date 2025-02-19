import { loggedOut } from '../../../auth/selectors';
import { replace } from '../../../navigation/actions';
import * as navigation from '../../../navigation/selectors';
import { AnyMatch } from '../../../navigation/types';
import { getQueryForParam } from '../../../navigation/utils';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { closeMobileMenu } from '../../actions';
import { loadMoreStudyGuides, openStudyGuides } from '../actions';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof openStudyGuides> = (services) => async() => {
  const state = services.getState();
  const query = navigation.query(state);
  const match = navigation.match(state);
  const loggedOutAndQueryMissingFirstChapter = select.loggedOutAndQueryMissingFirstChapter(state);
  const notLoggedIn = loggedOut(state);
  const summaryFilters = select.summaryFilters(state);
  const defaultFilter = select.defaultLocationFilter(state);

  if (loggedOutAndQueryMissingFirstChapter || (!notLoggedIn && defaultFilter)) {
    services.dispatch(replace(match as AnyMatch, {
      search: getQueryForParam(summaryFilters as unknown as Record<string, string[]>, query),
    }));
  } else {
    const studyGuides = select.summaryStudyGuides(state);
    const studyGuidesAreLoading = select.summaryIsLoading(state);

    if (studyGuides === null && studyGuidesAreLoading === false) {
      services.dispatch(loadMoreStudyGuides());
    }
  }

  services.dispatch(closeMobileMenu());
};

export const openStudyGuidesHook = actionHook(openStudyGuides, hookBody);
