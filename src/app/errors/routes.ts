import Loadable from 'react-loadable';
import { Route } from '../navigation/types';

const CATCH_ALL = '/(.*)';

export const notFound: Route<undefined> & { getFullUrl: () => string } = {
  component: Loadable({
    loader: () => import(/* webpackChunkName: "PageNotFound" */ './components/PageNotFound'),
    loading: () => null,
    modules: ['PageNotFound'],
    webpack: /* istanbul ignore next */ () => [(require as any).resolveWeak('./components/PageNotFound')],
  }),
  getFullUrl: () => 'https://openstax.org/error/404',
  getUrl: () => '/errors/404',
  name: 'NotFound',
  paths: [CATCH_ALL],
};
