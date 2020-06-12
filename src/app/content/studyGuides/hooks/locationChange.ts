import { GetHighlightsSetsEnum } from '@openstax/highlighter/dist/api';
import { AppServices, MiddlewareAPI } from '../../../types';
import {  maxHighlightsApiPageSize } from '../../constants';
import { bookAndPage } from '../../selectors';
import { loadAllHighlights } from '../../utils/sharedHighlightsUtils';
import { receiveStudyGuides } from '../actions';
import * as select from '../selectors';

// composed in /content/locationChange hook because it needs to happen after book load
const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const state = services.getState();

  const {book, page} = bookAndPage(state);
  const isEnabled = select.studyGuidesEnabled(state);
  const hasCurrentSummary = select.hasStudyGuides(state);

  if (!isEnabled || !book || !page || hasCurrentSummary) { return; }

  const highlights = await loadAllHighlights({
    book,
    highlightClient: services.highlightClient,
    pagination: {page: 1, sourceIds: [page.id], perPage: maxHighlightsApiPageSize},
    query: {
      sets: [GetHighlightsSetsEnum.Curatedopenstax],
    },
  });

  services.dispatch(receiveStudyGuides(highlights));
};

export default hookBody;
