import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { REACT_APP_ARCHIVE_URL_OVERRIDE } from '../../config';
import { Route } from '../navigation/types';
import { findPathForParams, getUrlRegexParams, injectParamsToBaseUrl } from '../navigation/utils';
import { assertDefined } from '../utils';
import { Params } from './types';

const MATCH_UUID = '[\\da-z]{8}-[\\da-z]{4}-[\\da-z]{4}-[\\da-z]{4}-[\\da-z]{12}';
const base = '/books/:book/pages/:page';

const contentPaths = injectParamsToBaseUrl(base, {
  book: [`book_uuid(${MATCH_UUID})@:book_version`, 'book_slug@:book_version', 'book_slug'],
  page: [`page_uuid(${MATCH_UUID})`, 'page_slug'],
});

type State = {} | {
  bookUid: string;
  bookVersion: string;
  pageUid: string;
};

export const content: Route<Params, State> = {
  component: Loadable({
    loader: () => import(/* webpackChunkName: "Content" */ './components/Content'),
    loading: () => null,
    modules: ['Content'],
  }),
  getSearch: (_params: Params): string => REACT_APP_ARCHIVE_URL_OVERRIDE
    ? `archive=${REACT_APP_ARCHIVE_URL_OVERRIDE}`
    : ''
  ,
  getUrl: (params: Params): string => {
    const parsedParams = getUrlRegexParams(params);
    const path = assertDefined(findPathForParams(parsedParams, contentPaths), 'Invalid parameters for content path');

    return pathToRegexp.compile(path)(parsedParams);
  },
  name: 'Content',
  paths: contentPaths,
};
