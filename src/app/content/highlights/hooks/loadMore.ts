import { GetHighlightsColorsEnum, GetHighlightsSetsEnum, Highlight } from '@openstax/highlighter/dist/api';
import { ActionHookBody, AppServices, MiddlewareAPI, Store } from '../../../types';
import { actionHook } from '../../../utils';
import { maxHighlightsApiPageSize, summaryPageSize } from '../../constants';
import { book as bookSelector } from '../../selectors';
import { loadMoreSummaryHighlights, receiveSummaryHighlights, setSummaryFilters } from '../actions';
import * as select from '../selectors';
import * as studyGuidesSelect from '../../studyGuides/selectors';
import { HighlightLocationFilters, SummaryHighlightsPagination} from '../types';
import {
  fetchHighlightsForSource,
  formatReceivedHighlights,
  getNewSources,
  incrementPage,
  SummaryHighlightsQuery,
} from './utils';

const loadUntilPageSize = async({
  previousPagination,
  ...args
}: {
  previousPagination: SummaryHighlightsPagination,
  getState: Store['getState'],
  highlightClient: AppServices['highlightClient'],
  highlights?: Highlight[]
  sourcesFetched: string[],
  pageSize?: number,
  query: SummaryHighlightsQuery
}): Promise<{pagination: SummaryHighlightsPagination, highlights: Highlight[]}> => {
  const state = args.getState();
  const book = bookSelector(state);

  const {page, sourceIds, perPage} = previousPagination
    ? incrementPage(previousPagination)
    : {
      page: 1,
      perPage: args.pageSize || maxHighlightsApiPageSize,
      sourceIds: getNewSources(state, args.sourcesFetched, args.pageSize),
    };

  if (!book || sourceIds.length === 0) {
    return {pagination: null, highlights: args.highlights || []};
  }

  const {highlights, pagination} = await fetchHighlightsForSource({
    book,
    highlightClient: args.highlightClient,
    pagination: {page, sourceIds, perPage},
    prevHighlights: args.highlights,
    query: args.query,
  });

  if (highlights.length < perPage || !args.pageSize) {
    return loadUntilPageSize({
      ...args,
      highlights,
      previousPagination: pagination,
      sourcesFetched: [...args.sourcesFetched, ...sourceIds],
    });
  }
  return {pagination, highlights};
};

export const createSummaryHighlightsLoader = ({
  locationFilters,
  previousPagination,
  sourcesFetched,
  query,
}: {
  locationFilters: HighlightLocationFilters,
  previousPagination: SummaryHighlightsPagination,
  sourcesFetched: string[],
  query: SummaryHighlightsQuery,
}) => async({getState, highlightClient}: MiddlewareAPI & AppServices, pageSize?: number) => {
  const {pagination, highlights} = await loadUntilPageSize({
    getState,
    highlightClient,
    pageSize,
    previousPagination,
    query,
    sourcesFetched,
  });

  const formattedHighlights = formatReceivedHighlights(highlights, locationFilters);

  return {formattedHighlights, pagination};
};

export const loadMoreMyHighlights = (services: MiddlewareAPI & AppServices, pageSize?: number) => {
  const state = services.getState();

  const locationFilters = select.highlightLocationFilters(state);
  const previousPagination = select.summaryPagination(state);
  const sourcesFetched = Object.keys(select.loadedCountsPerSource(state));
  const colors = select.summaryColorFilters(state);

  const query = {
    colors: [...colors] as unknown as GetHighlightsColorsEnum[] ,
    sets: [GetHighlightsSetsEnum.Curatedopenstax],
  };

  const loadMore = createSummaryHighlightsLoader({
    locationFilters,
    previousPagination,
    query,
    sourcesFetched,
  });

  return loadMore(services, pageSize);
};

export const loadMoreStudyGuidesHighlights = (services: MiddlewareAPI & AppServices, pageSize?: number) => {
  const state = services.getState();

  const locationFilters = studyGuidesSelect.highlightLocationFilters(state);
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

  const tempAllColors = [
    GetHighlightsColorsEnum.Blue,
    GetHighlightsColorsEnum.Green,
    GetHighlightsColorsEnum.Pink,
    GetHighlightsColorsEnum.Purple,
    GetHighlightsColorsEnum.Yellow,
  ];

  const query = {
    colors: tempAllColors,
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

export const hookBody: ActionHookBody<typeof setSummaryFilters | typeof loadMoreSummaryHighlights> =
  (services) => async() => {
    const {formattedHighlights, pagination} = await loadMoreMyHighlights(services, summaryPageSize);
    services.dispatch(receiveSummaryHighlights(formattedHighlights, {pagination}));
  };

export const loadMoreHook = actionHook(loadMoreSummaryHighlights, hookBody);
export const setSummaryFiltersHook = actionHook(setSummaryFilters, hookBody);
