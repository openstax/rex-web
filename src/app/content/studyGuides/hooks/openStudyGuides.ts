import { GetHighlightsColorsEnum, GetHighlightsSetsEnum } from '@openstax/highlighter/dist/api';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { summaryPageSize } from '../../constants';
import { book as bookSelector, highlightLocationFilters } from '../../selectors';
import { formatReceivedHighlights, loadUntilPageSize } from '../../utils/highlightLoadingUtils';
import { openStudyGuides, receiveSummaryStudyGuides } from '../actions';
import { allColors } from '../constants';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof openStudyGuides> = ({
  dispatch,
  getState,
  highlightClient,
}) => async() => {
  const state = getState();
  const book = bookSelector(state);
  const totalCounts = select.totalCountsPerPageOrEmpty(state);
  const locationFilters = highlightLocationFilters(state);

  const summaryNeedsInitialization = () => select.summaryStudyGuides(state) === null
    && select.summaryIsLoading(state) === false;

  if (summaryNeedsInitialization()) {
    const {highlights, pagination} = await loadUntilPageSize({
      book,
      colors: allColors as unknown as GetHighlightsColorsEnum[],
      countsPerSource: totalCounts,
      highlightClient,
      pageSize: summaryPageSize,
      previousPagination: null,
      sets: [GetHighlightsSetsEnum.Curatedopenstax],
      sourcesFetched: [],
    });

    dispatch(receiveSummaryStudyGuides(formatReceivedHighlights(highlights, locationFilters), pagination));
  }
};

export const openStudyGuidesHook = actionHook(openStudyGuides, hookBody);
