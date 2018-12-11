import { Route } from '../navigation/types';
import * as components from './components';

const CATCH_ALL = '/(.*)';

export const notFound: Route<undefined> = {
  component: components.PageNotFound,
  getUrl: () => '/errors/404',
  name: 'NotFound',
  paths: [CATCH_ALL],
};
