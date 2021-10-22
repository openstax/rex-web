import { replace } from '../../../navigation/actions';
import * as navigation from '../../../navigation/selectors';
import { updateQuery } from '../../../navigation/utils';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { assertDefined } from '../../../utils/assertions';
import { loadMoreStudyGuides, openStudyGuides } from '../actions';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof openStudyGuides> = (services) => async() => {
  const state = services.getState();
  const query = navigation.query(state);
  const match = assertDefined(navigation.match(state), 'match not defined');
  const loggedOutAndQueryMissingFirstChapter = select.loggedOutAndQueryMissingFirstChapter(state);
  const loggedInAndQueryMissingLocationIds = select.loggedInAndQueryMissingLocationIds(state);
  const defaultFilters = select.defaultFilters(state);
  console.log('default filters: ', defaultFilters);

  if (loggedOutAndQueryMissingFirstChapter || loggedInAndQueryMissingLocationIds) {
    console.log('open SG - if');
    services.dispatch(replace(match, {
      search: updateQuery(defaultFilters as any as Record<string, string[]>, query),
    }));
  } else {
    console.log('open SG - else');
    const studyGuides = select.summaryStudyGuides(state);
    const studyGuidesAreLoading = select.summaryIsLoading(state);

    if (studyGuides === null && studyGuidesAreLoading === false) {
      services.dispatch(loadMoreStudyGuides());
    }
  }
};

export const openStudyGuidesHook = actionHook(openStudyGuides, hookBody);
