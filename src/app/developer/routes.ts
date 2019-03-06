import pathToRegexp from 'path-to-regexp';
import { Route } from '../navigation/types';
import Home from './components/Home';

const ROUTES_PATH = '/';

export const routes: Route<undefined, undefined> = {
  component: Home,
  getUrl: (): string => pathToRegexp.compile(ROUTES_PATH)(),
  name: 'Developer / Routes',
  paths: [ROUTES_PATH],
};
