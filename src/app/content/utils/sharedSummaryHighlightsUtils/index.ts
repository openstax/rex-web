export const loadUntilPageSize = async({
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