import {
  GetHighlightsColorsEnum,
  GetHighlightsSetsEnum,
  GetHighlightsSourceTypeEnum,
  GetHighlightsSummarySetsEnum,
  GetHighlightsSummarySourceTypeEnum,
} from '@openstax/highlighter/dist/api';
import { AppServices, MiddlewareAPI } from '../../../types';
import { assertDefined } from '../../../utils';
// Temporary import from /highlights directory until we make all this logic reusable and move it to content/
import { formatReceivedHighlights } from '../../highlights/hooks/utils';
import { highlightLocationFilters } from '../../highlights/selectors';
import { bookAndPage } from '../../selectors';
import { receiveStudyGuides, receiveStudyGuidesHighlights } from '../actions';
import { studyGuidesEnabled, hasStudyGuides } from '../selectors';

// composed in /content/locationChange hook because it needs to happen after book load
const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const state = services.getState();

  const {book} = bookAndPage(state);
  const isEnabled = studyGuidesEnabled(state);
  const hasCurrentSummary = hasStudyGuides(state);

  if (!isEnabled || !book || hasCurrentSummary) { return; }

  const studyGuidesSummary = await services.highlightClient.getHighlightsSummary({
    scopeId: book.id,
    sets: [GetHighlightsSummarySetsEnum.Curatedopenstax],
    sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
  });

  const tempAllColors = [
    GetHighlightsColorsEnum.Blue,
    GetHighlightsColorsEnum.Green,
    GetHighlightsColorsEnum.Pink,
    GetHighlightsColorsEnum.Purple,
    GetHighlightsColorsEnum.Yellow,
  ];

  const locationFilters = highlightLocationFilters(state);
  // page ids from Anatomy and Physiology for which study guides endpoint is returning something
  const tempSourcesIds = [
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
  ];

  const highlightsResponse = await services.highlightClient.getHighlights({
    colors: tempAllColors,
    page: 1,
    perPage: 10,
    scopeId: book.id,
    sets: [GetHighlightsSetsEnum.Curatedopenstax],
    sourceIds: tempSourcesIds,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
  });
  
  const formattedHighlights = formatReceivedHighlights(
    assertDefined(highlightsResponse.data, 'expected api data response to be defined'),
    locationFilters);

  services.dispatch(receiveStudyGuidesHighlights(formattedHighlights, null));

  services.dispatch(receiveStudyGuides(studyGuidesSummary));
};

export default hookBody;
