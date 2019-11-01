import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { Route } from '../navigation/types';
import { SelectedResult } from './search/types';
import { Params } from './types';

const CONTENT_PATH = '/books/:book/pages/:page';
const VERSIONED_CONTENT_PATH = '/books/:book([^@/]+)@:version/pages/:page';

interface State {
  bookUid: string;
  bookVersion: string;
  pageUid: string;
  search?: {query: string | null, selectedResult: SelectedResult | null};
}

export const content: Route<Params, State> = {
  component: Loadable({
    loader: () => import(/* webpackChunkName: "Content" */ './components/Content'),
    loading: () => null,
    modules: ['Content'],
  }),
  getUrl: (params: Params): string => params.version
    ? pathToRegexp.compile(VERSIONED_CONTENT_PATH)(params)
    : pathToRegexp.compile(CONTENT_PATH)(params),
  name: 'Content',
  paths: [VERSIONED_CONTENT_PATH, CONTENT_PATH],
};
