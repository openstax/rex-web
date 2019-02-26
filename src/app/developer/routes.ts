import pathToRegexp from 'path-to-regexp';
import { Route } from '../navigation/types';
import * as components from './components';

const ROUTES_PATH = '/rex-developer/routes';

export const content: Route<undefined, undefined> = {
  component: components.Routes,
  getUrl: (): string => pathToRegexp.compile(ROUTES_PATH)(),
  name: 'Developer / Routes',
  paths: [ROUTES_PATH],
};
