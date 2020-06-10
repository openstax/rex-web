import {
  GetHighlightsColorsEnum,
  GetHighlightsSetsEnum,
  GetHighlightsSummarySetsEnum,
  GetHighlightsSummarySourceTypeEnum,
} from '@openstax/highlighter/dist/api';
import { AppServices, MiddlewareAPI } from '../../../types';
import { bookAndPage } from '../../selectors';
import { createSummaryHighlightsLoader } from '../../utils/sharedHighlightsUtils';
import { receiveStudyGuides, receiveStudyGuidesHighlights } from '../actions';
import * as select from '../selectors';

export const loadMoreStudyGuidesHighlights = (services: MiddlewareAPI & AppServices, pageSize?: number) => {
  const state = services.getState();

  const locationFilters = select.highlightLocationFilters(state);
  const colors = /*studyGuidesSelect.summaryColorFilters(state) */ [
    GetHighlightsColorsEnum.Blue,
    GetHighlightsColorsEnum.Green,
    GetHighlightsColorsEnum.Pink,
    GetHighlightsColorsEnum.Purple,
    GetHighlightsColorsEnum.Yellow,
  ];

  const previousPagination = /*studyGuidesSelect.studyGuidesPagination(state);*/ {
    page: 0, // because page gets incremented if pagination is passed
    perPage: 100,
    sourceIds: [
      '00a2d5b6-9b1d-49ab-a40d-fcd30ceef643',
      '2c60e072-7665-49b9-a2c9-2736b72b533c',
      '5e1ff6e7-0980-4ae0-bc8a-4b591a7c1760',
      'a1979af6-5761-4483-8a50-6ba57729f769',
      'ada35081-9ec4-4eb8-98b2-3ce350d5427f',
      'b82d4112-06e7-42bb-bd70-4e83cdfe5df0',
      'ccc4ed14-6c87-408b-9934-7a0d279d853a',
      'cdf9ebbd-b0fe-4fce-94b4-512f2a574f18',
      'e4e45509-bfc0-4aee-b73e-17b7582bf7e1',
      'f10ff9a5-0428-4700-8676-96ad36c4ac64',
    ],
  };

  const query = {
    colors,
    sets: [GetHighlightsSetsEnum.Curatedopenstax],
  };

  const loadMore = createSummaryHighlightsLoader({
    locationFilters,
    previousPagination,
    query,
    sourcesFetched: [],
  });

  return loadMore(services, pageSize);
};

// composed in /content/locationChange hook because it needs to happen after book load
const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const state = services.getState();

  const {book} = bookAndPage(state);
  const isEnabled = select.studyGuidesEnabled(state);
  const hasCurrentSummary = select.hasStudyGuides(state);

  if (!isEnabled || !book || hasCurrentSummary) { return; }

  const studyGuidesSummary = await services.highlightClient.getHighlightsSummary({
    scopeId: book.id,
    sets: [GetHighlightsSummarySetsEnum.Curatedopenstax],
    sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
  });

  const {formattedHighlights, pagination} = await loadMoreStudyGuidesHighlights(services);

  services.dispatch(receiveStudyGuidesHighlights(formattedHighlights, pagination));
  services.dispatch(receiveStudyGuides(studyGuidesSummary));
};

export default hookBody;
