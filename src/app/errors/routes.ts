import Loadable from 'react-loadable';
import { Route } from '../navigation/types';
import { assertWindow } from '../utils';

const CATCH_ALL = '/(.*)';

export const notFound: Route<undefined> & { redirect: () => void } = {
  component: Loadable({
    loader: () => import(/* webpackChunkName: "LoaderCentered" */ './components/LoaderCentered'),
    loading: () => null,
    modules: ['LoaderCentered'],
    webpack: /* istanbul ignore next */ () => [(require as any).resolveWeak('./components/LoaderCentered')],
  }),
  getUrl: () => '/error/404',
  name: 'NotFound',
  paths: [CATCH_ALL],
  redirect: () => assertWindow().location.replace(notFound.getUrl()),
};
