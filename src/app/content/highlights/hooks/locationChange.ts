import { GetHighlightsSourceTypeEnum, GetHighlightsSummarySourceTypeEnum } from '@openstax/highlighter/dist/api';
import { user } from '../../../auth/selectors';
import { AppServices, MiddlewareAPI } from '../../../types';
import { bookAndPage } from '../../selectors';
import { receiveHighlights, receiveHighlightsTotalCounts } from '../actions';
import * as select from '../selectors';
import { CountsPerSource } from '../types';

const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const {dispatch, getState, highlightClient} = services;
  const state = getState();
  const {book, page} = bookAndPage(state);
  const authenticated = user(state);
  const loaded = select.highlightsLoaded(state);
  const totalCountsInState = select.totalCountsPerPage(state);
  const locationFilters = select.highlightLocationFilters(state);

  if (!authenticated || !book || !page || typeof(window) === 'undefined' || loaded) {
    return;
  }

  const highlights = await highlightClient.getHighlights({
    perPage: 100,
    scopeId: book.id,
    sourceIds: [page.id],
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
  });

  if (highlights.data) {
    dispatch(receiveHighlights(highlights.data));
  }

  if (totalCountsInState) { return; }

  const totalCounts = await highlightClient.getHighlightsSummary({
    scopeId: book.id,
    sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
  });

  if (totalCounts.countsPerSource) {
    // TODO remove cast when swagger is updated
    dispatch(receiveHighlightsTotalCounts(totalCounts.countsPerSource as unknown as CountsPerSource, locationFilters));
  }
};

export default hookBody;
