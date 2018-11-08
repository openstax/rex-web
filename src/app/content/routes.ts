import pathToRegexp from 'path-to-regexp';
import * as components from './components';
import { Params } from './types';

const CONTENT_PATH = '/books/:bookId/pages/:pageId';

export const content: Route<Params> = {
  component: components.Content,
  getUrl: (params: Params): string => pathToRegexp.compile(CONTENT_PATH)(params),
  name: 'Content',
  paths: [CONTENT_PATH],
};
