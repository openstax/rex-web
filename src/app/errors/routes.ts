import * as components from './components';

const CATCH_ALL = '/(.*)';

export const NotFound: Route = {
  name: 'NotFound',
  paths: [CATCH_ALL],
  getUrl: () => '/404',
  component: components.PageNotFound 
};
