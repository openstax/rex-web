import { loggedOut } from '../../../auth/selectors';
import { replace } from '../../../navigation/actions';
import * as navigation from '../../../navigation/selectors';
import { updateQuery } from '../../../navigation/utils';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { assertDefined } from '../../../utils/assertions';
import * as selectContent from '../../selectors';
import { archiveTreeSectionIsChapter, findArchiveTreeNode } from '../../utils/archiveTreeUtils';
import { loadMoreStudyGuides, openStudyGuides } from '../actions';
import { colorfilterLabels } from '../constants';
import * as select from '../selectors';
import { getFiltersFromQuery } from '../utils';

export const hookBody: ActionHookBody<typeof openStudyGuides> = (services) => async() => {
  const state = services.getState();
  const defaultFilter = select.defaultLocationFilter(state);
  const notLoggedIn = loggedOut(state);
  const book = selectContent.book(state);
  const firstChapter = book && findArchiveTreeNode(archiveTreeSectionIsChapter, book.tree);
  const query = navigation.query(state);
  const match = assertDefined(navigation.match(state), 'match not defined');
  const colorsWithSG = select.highlightColorFiltersWithContent(state);
  const { colors: colorsFromQuery, locationIds } = getFiltersFromQuery(query);
  const colors = colorsFromQuery.length
    ? colorsFromQuery
    : Array.from(colorsWithSG.size ? colorsWithSG : colorfilterLabels);

  if (notLoggedIn && firstChapter && !locationIds.includes(firstChapter.id)) {
    // Non logged in users will always see SG only for the first chapter
    const defaultFilters = { colors, locationIds: [firstChapter.id] };
    services.dispatch(replace(match, {
      search: updateQuery(defaultFilters as any as Record<string, string[]>, query),
    }));
  } else if (!notLoggedIn && locationIds.length === 0 && defaultFilter) {
    // Set default locationId filter for logged in users
    const defaultFilters = { colors, locationIds: [defaultFilter.id] };
    services.dispatch(replace(match, {
      search: updateQuery(defaultFilters as any as Record<string, string[]>, query),
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
