import { GetHighlightsSourceTypeEnum, GetHighlightsSummarySourceTypeEnum } from '@openstax/highlighter/dist/api';
import isEqual from 'lodash/fp/isEqual';
import { user } from '../../../auth/selectors';
import { AppServices, MiddlewareAPI } from '../../../types';
import { bookAndPage } from '../../selectors';
import { receiveHighlights, receiveHighlightsTotalCounts, setHighlightsTotalCountsPerLocation } from '../actions';
import * as select from '../selectors';
import { mergeHighlightsTotalCounts } from '../utils';

const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const {dispatch, getState, highlightClient} = services;
  const state = getState();
  const {book, page} = bookAndPage(state);
  const authenticated = user(state);
  const loaded = select.highlightsLoaded(state);
  const totalCountsInState = select.totalCountsPerPage(state);

  if (!authenticated || !book || !page || typeof(window) === 'undefined' || loaded) {
    return;
  }

  const [highlights, totalCounts] = await Promise.all([
    await highlightClient.getHighlights({
      perPage: 100,
      scopeId: book.id,
      sourceIds: [page.id],
      sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
    }),
    await highlightClient.getHighlightsSummary({
      scopeId: book.id,
      sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
    }),
  ]);

  if (highlights.data) {
    dispatch(receiveHighlights(highlights.data));
  }

  if (
    totalCounts.countsPerSource
    && !isEqual(totalCounts.countsPerSource, totalCountsInState)
  ) {
    dispatch(receiveHighlightsTotalCounts(totalCounts.countsPerSource));
    const mergedTotalCounts = mergeHighlightsTotalCounts(book, totalCounts.countsPerSource);
    dispatch(setHighlightsTotalCountsPerLocation(mergedTotalCounts));
  }
};

export default hookBody;
