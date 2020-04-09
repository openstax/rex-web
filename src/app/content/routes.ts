import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { REACT_APP_ARCHIVE_URL } from '../../config';
import { Route } from '../navigation/types';
import { getUrlRegexParams } from '../navigation/utils';
import { SelectedResult } from './search/types';
import { Params } from './types';

const MATCH_UUID = '[\\da-z]{8}-[\\da-z]{4}-[\\da-z]{4}-[\\da-z]{4}-[\\da-z]{12}';

const CONTENT_PATH = '/books/:book_slug/pages/:page_slug';
const UUID_CONTENT_PATH = `/books/:book_uuid(${MATCH_UUID})@:book_version/pages/:page_slug`;
const VERSIONED_CONTENT_PATH = '/books/:book_slug@:book_version/pages/:page_slug';

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
  getSearch: (_params: Params): string => REACT_APP_ARCHIVE_URL
    ? `archive=${REACT_APP_ARCHIVE_URL}`
    : ''
  ,
  getUrl: (params: Params): string => {
    const {book} = params;
    if ('uuid' in book) {
      return pathToRegexp.compile(UUID_CONTENT_PATH)(getUrlRegexParams(params));
    }
    if ('version' in book) {
      return pathToRegexp.compile(VERSIONED_CONTENT_PATH)(getUrlRegexParams(params));
    }

    return pathToRegexp.compile(CONTENT_PATH)(getUrlRegexParams(params));
  },
  name: 'Content',
  paths: [UUID_CONTENT_PATH, VERSIONED_CONTENT_PATH, CONTENT_PATH],
};
