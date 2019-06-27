import { SearchResult } from '@openstax/open-search-client';

export interface State {
  results: SearchResult | null;
  loading: boolean;
  query: null | string;
}
