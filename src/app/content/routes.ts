import pathToRegexp from 'path-to-regexp';
import { Route } from '../navigation/types';
import * as components from './components';
import { Params } from './types';

const CONTENT_PATH = '/books/:bookId/pages/:pageId';

interface State {
  bookUid: string;
  bookVersion: string;
  pageUid: string;
}

export const content: Route<Params, State> = {
  component: components.Content,
  getUrl: (params: Params): string => pathToRegexp.compile(CONTENT_PATH)(params),
  name: 'Content',
  paths: [CONTENT_PATH],
};
