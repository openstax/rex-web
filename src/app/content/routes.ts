import pathToRegexp from 'path-to-regexp';
import React from 'react';
import Loadable from 'react-loadable';
import { useSelector } from 'react-redux';
import { REACT_APP_ARCHIVE_URL_OVERRIDE } from '../../config';
import * as selectNavigation from '../navigation/selectors';
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

// tslint:disable-next-line:variable-name
const ReadingContent = Loadable({
  loader: () => import(/* webpackChunkName: "Content" */ './components/Content'),
  loading: () => null,
  modules: ['Content'],
});

// tslint:disable-next-line:variable-name
const AssignableContent = Loadable({
  loader: () => import(/* webpackChunkName: "Content" */ './components/Reading'),
  loading: () => null,
  modules: ['Reading'],
});

// tslint:disable-next-line:variable-name
const ContentMode = () => {
  const query = useSelector(selectNavigation.query);
  return query.mode === 'assignable'
    ? React.createElement(AssignableContent)
    : React.createElement(ReadingContent)
  ;
};

export const content: Route<Params, State> = {
  component: ContentMode,
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

const createReadingPaths = injectParamsToBaseUrl('/books/:book/create-reading', {
  book: [`book_uuid(${MATCH_UUID})@:book_version`, 'book_slug@:book_version', 'book_slug'],
});
export const createReading: Route<Pick<Params, 'book'>> = {
  component: Loadable({
    loader: () => import(/* webpackChunkName: "Content" */ './components/CreateReading'),
    loading: () => null,
    modules: ['CreateReading'],
  }),
  getUrl: (params: Pick<Params, 'book'>): string => {
    const parsedParams = getUrlRegexParams(params);
    const path = assertDefined(findPathForParams(parsedParams, createReadingPaths),
      'Invalid parameters for content path'
    );

    return pathToRegexp.compile(path)(parsedParams);
  },
  name: 'CreateReading',
  paths: createReadingPaths,
};
