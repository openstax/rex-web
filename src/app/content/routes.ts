import pathToRegexp from 'path-to-regexp';
import React from 'react';
import Loadable from 'react-loadable';
import { useSelector } from 'react-redux';
import { REACT_APP_ARCHIVE_URL_OVERRIDE } from '../../config';
import * as selectNavigation from '../navigation/selectors';
import { findPathForParams, getUrlRegexParams, injectParamsToBaseUrl } from '../navigation/utils';
import { assertDefined } from '../utils';
import { ContentRoute, Params } from './types';

const MATCH_UUID = '[\\da-z]{8}-[\\da-z]{4}-[\\da-z]{4}-[\\da-z]{4}-[\\da-z]{12}';
const prerenderedBase = '/books/:book/pages/:page';
const dynamicBase = '/apps/rex' + prerenderedBase;

const contentPaths = [
  ...injectParamsToBaseUrl(prerenderedBase, {
    // switch this after a transition period starting with CORGI using the `dynamicBase` url on its previews
    book: [
      `book_uuid(${MATCH_UUID})@:book_contentVersion`,
      'book_slug@:book_contentVersion',
      'book_slug@:book_contentVersion\\::book_archiveVersion',
      'book_slug',
    ],
    page: [`page_uuid(${MATCH_UUID})`, 'page_slug'],
    // book: ['book_slug'],
    // page: ['page_slug'],
  }),
  ...injectParamsToBaseUrl(dynamicBase, {
    book: [
      `book_uuid(${MATCH_UUID})@:book_contentVersion`,
      'book_slug@:book_contentVersion',
      'book_slug@:book_contentVersion\\::book_archiveVersion',
      'book_slug',
    ],
    page: [`page_uuid(${MATCH_UUID})`, 'page_slug'],
  }),
];

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

export const content: ContentRoute = {
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
