import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { Route } from '../navigation/types';

const ROUTES_PATH = '/';

export const developerHome: Route<undefined, undefined> = {
  component: Loadable({
    loader: () => import(/* webpackChunkName: "DeveloperHome" */ './components/Home'),
    loading: () => null,
    modules: ['DeveloperHome'],
    webpack: /* istanbul ignore next */ () => [(require as any).resolveWeak('./components/Home')],
  }),
  getUrl: (): string => pathToRegexp.compile(ROUTES_PATH)(),
  name: 'Developer Home',
  paths: [ROUTES_PATH],
};

const BOOK_TOOLS_PATH = '/rex/tools/:book';
export const bookTools: Route<{book: string}, undefined> = {
  component: Loadable({
    loader: () => import(/* webpackChunkName: "book-tools" */ './components/Tools'),
    loading: () => null,
    modules: ['./components/Tools'],
  }),
  getUrl: (params: {book: string}): string => pathToRegexp.compile(BOOK_TOOLS_PATH)(params),
  name: 'Book Tools',
  paths: [BOOK_TOOLS_PATH],
};

const AUDIT_TOC_HISTORY_PATH = '/rex/tools/:book/audit-toc';
export const auditTocHistory: Route<{book: string}, undefined> = {
  component: Loadable({
    loader: () => import(/* webpackChunkName: "audit-toc-history" */ './tools/audit-toc-history/Audit'),
    loading: () => null,
    modules: ['./tools/audit-toc-history/Audit'],
  }),
  getUrl: (params: {book: string}): string => pathToRegexp.compile(AUDIT_TOC_HISTORY_PATH)(params),
  name: 'Audit TOC History',
  paths: [AUDIT_TOC_HISTORY_PATH],
};

const CNX_MAPPING_PATH = '/rex/tools/:book/cnx-mapping';
export const cnxLinkMapping: Route<{book: string}, undefined> = {
  component: Loadable({
    loader: () => import(/* webpackChunkName: "cnx-link-mapping" */ './tools/cnx-link-mapping/Links'),
    loading: () => null,
    modules: ['./tools/cnx-link-mapping/Links'],
  }),
  getUrl: (params: {book: string}): string => pathToRegexp.compile(CNX_MAPPING_PATH)(params),
  name: 'CNX Link Mapping',
  paths: [CNX_MAPPING_PATH],
};
