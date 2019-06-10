import { SearchResult } from '@openstax/open-search-client';

export interface State {
  results: SearchResult | null;
  loading: boolean;
  open: boolean;
  query: null | string;
}
