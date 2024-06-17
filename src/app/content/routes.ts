import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { REACT_APP_ARCHIVE_URL_OVERRIDE } from '../../config';
import { Route } from '../navigation/types';
import { findPathForParams, getUrlRegexParams, injectParamsToBaseUrl } from '../navigation/utils';
import { assertDefined } from '../utils';
import { ContentRoute, Params } from './types';

const MATCH_UUID = '[\\da-z]{8}-[\\da-z]{4}-[\\da-z]{4}-[\\da-z]{4}-[\\da-z]{12}';
const dynamicPrefix = '/apps/rex';

const prerenderedBase = '/books/:book/pages/:page';
const dynamicBase = dynamicPrefix + prerenderedBase;
const courseBase = `${dynamicPrefix}/course/:courseId/resources/:resourceId${prerenderedBase}`;

const paramVariants = {
  book: [
    `book_uuid(${MATCH_UUID})@:book_contentVersion\\::book_archiveVersion`,
    `book_uuid(${MATCH_UUID})@:book_contentVersion`,
    'book_slug@:book_contentVersion\\::book_archiveVersion',
    'book_slug@:book_contentVersion',
    'book_slug',
  ],
  page: [`page_uuid(${MATCH_UUID})`, 'page_slug'],
}

/*
 * this is in a transition phase. we are moving all of the more dynamic routing
 * under a different url prefix, so anything not under that new url prefix
 * should literally match one of the pre-rendered files.
 *
 * once this change is released, all places that use the dynamic routing (CORGI for one)
 * need to be updated with the new url base, then the first section of the route path
 * config can be removed
 */
const contentPaths = [
  '/books/:book_slug',
  ...injectParamsToBaseUrl(prerenderedBase, paramVariants),
  // switch this after a transition period starting with CORGI using the `dynamicBase` url on its previews
  // ...injectParamsToBaseUrl(prerenderedBase, { book: ['book_slug'], page: ['page_slug'] }),
  ...injectParamsToBaseUrl(dynamicBase, paramVariants),
  ...injectParamsToBaseUrl(courseBase, paramVariants),
];

// tslint:disable-next-line:variable-name
const ReadingContent = Loadable({
  loader: () => import(/* webpackChunkName: "route-content" */ './components/Content'),
  loading: () => null,
  modules: ['route-content'],
});

export const content: ContentRoute = {
  component: ReadingContent,
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

const assignedPath = dynamicPrefix + '/assigned/:activityId';

// tslint:disable-next-line:variable-name
const AssignedContent = Loadable({
  loader: () => import(/* webpackChunkName: "route-assigned" */ './components/Assigned'),
  loading: () => null,
  modules: ['route-assigned'],
});

export const assigned: Route<{activityId: string}> = {
  component: AssignedContent,
  getSearch: (_params: {activityId: string}): string => REACT_APP_ARCHIVE_URL_OVERRIDE
    ? `archive=${REACT_APP_ARCHIVE_URL_OVERRIDE}`
    : ''
  ,
  getUrl: (params: {activityId: string}): string => {
    return pathToRegexp.compile(assignedPath)(params);
  },
  name: 'Assigned',
  paths: [assignedPath],
};
