import omit from 'lodash/fp/omit';
import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { Route } from '../navigation/types';
import { getUrlRegexParams } from '../navigation/utils';
import { SelectedResult } from './search/types';
import { Params } from './types';
import { findPathForParams } from './utils/urlUtils';
import { assertDefined } from '../utils';

const MATCH_UUID = '[\\da-z]{8}-[\\da-z]{4}-[\\da-z]{4}-[\\da-z]{4}-[\\da-z]{12}';
const base = '/books/:book/pages/:page';

/*
 * Recursively creates combinations of supplied replacements
 * for the base parameter in an url
 */

const injectParamsToBaseUrl = (baseUrl: string, params: {[key: string]: string[]}): string[] => {
  const paramKeys: Array<keyof typeof params> = Object.keys(params);
  const keyToInject = paramKeys[0];

  return params[keyToInject].reduce((output, value) => {
    const injected = baseUrl.replace(new RegExp(`(?<=:)${keyToInject}`), value);
    return paramKeys.length === 1
      ? [...output, injected]
      : [...output, ...injectParamsToBaseUrl(injected, omit([keyToInject], params))];
  }, [] as string[]);
};

const contentPaths = injectParamsToBaseUrl(base, {
  book: [`book_uuid(${MATCH_UUID})@:book_version`, 'book_slug@:book_version', 'book_slug'],
  page: [`page_uuid(${MATCH_UUID})`, 'page_slug'],
});

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
    const parsedParams = getUrlRegexParams(params);
    const path = assertDefined(findPathForParams(parsedParams, contentPaths), 'Ivalid parameters for content path');

    return pathToRegexp.compile(path)(parsedParams);
  },
  name: 'Content',
  paths: contentPaths,
};
