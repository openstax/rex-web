import Loadable from 'react-loadable';
import { Route } from '../navigation/types';

const CATCH_ALL = '/(.*)';

type Params = {
  url: string;
};

export const notFound: Route<Params> = {
  component: Loadable({
    loader: () => import(/* webpackChunkName: "LoaderCentered" */ './components/LoaderCentered'),
    loading: () => null,
    modules: ['LoaderCentered'],
    webpack: /* istanbul ignore next */ () => [(require as any).resolveWeak('./components/LoaderCentered')],
  }),
  getSearch: (params: Params): string => `path=${params.url}`,
  getUrl: (_params: Params) => '/error/404',
  name: 'NotFound',
  paths: [CATCH_ALL],
};
