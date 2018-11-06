import pathToRegexp from 'path-to-regexp';
import {Params} from './types';
import * as components from './components';

const CONTENT_PATH = '/books/:bookId/pages/:pageId';

export const content: Route = {
  name: 'Content',
  component: components.Content,
  getUrl: (params: Params): string => pathToRegexp.compile(CONTENT_PATH)(params),
  paths: [CONTENT_PATH],
};
