import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { Route } from '../navigation/types';
import { SelectedResult } from './search/types';
import { Params } from './types';

const MATCH_UUID = '[\\da-z]{8}-[\\da-z]{4}-[\\da-z]{4}-[\\da-z]{4}-[\\da-z]{12}';

const CONTENT_PATH = '/books/:book/pages/:page';
const UUID_CONTENT_PATH = `/books/:uuid(${MATCH_UUID})@:version/pages/:page`;
const VERSIONED_CONTENT_PATH = '/books/:book@:version/pages/:page';

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
  getUrl: (params: Params): string => {
    if ('uuid' in params) {
      return pathToRegexp.compile(UUID_CONTENT_PATH)(params);
    }
    if ('version' in params) {
      return pathToRegexp.compile(VERSIONED_CONTENT_PATH)(params);
    }
    return pathToRegexp.compile(CONTENT_PATH)(params);
  },
  name: 'Content',
  paths: [UUID_CONTENT_PATH, VERSIONED_CONTENT_PATH, CONTENT_PATH],
};
