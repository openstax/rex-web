import * as components from './components';

const CATCH_ALL = '/(.*)';

export const notFound: Route = {
  component: components.PageNotFound,
  getUrl: () => '/404',
  name: 'NotFound',
  paths: [CATCH_ALL],
};
