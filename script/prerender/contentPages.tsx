import dateFns from 'date-fns';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Loadable from 'react-loadable';
import { EnumChangefreq } from 'sitemap';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components/macro';
import asyncPool from 'tiny-async-pool';
import createApp from '../../src/app';
import { AppOptions } from '../../src/app';
import { content } from '../../src/app/content/routes';
import { Book } from '../../src/app/content/types';
import { formatBookData, getUrlParamForPageId, stripIdVersion } from '../../src/app/content/utils';
import { findTreePages } from '../../src/app/content/utils/archiveTreeUtils';
import { developerHome } from '../../src/app/developer/routes';
import { notFound } from '../../src/app/errors/routes';
import * as errorSelectors from '../../src/app/errors/selectors';
import * as headSelectors from '../../src/app/head/selectors';
import { Link, Meta } from '../../src/app/head/types';
import * as navigationSelectors from '../../src/app/navigation/selectors';
import { AnyMatch, Match } from '../../src/app/navigation/types';
import { matchUrl } from '../../src/app/navigation/utils';
import { AppServices, AppState } from '../../src/app/types';
import { assertDefined } from '../../src/app/utils';
import { BOOKS } from '../../src/config';
import FontCollector from '../../src/helpers/FontCollector';
import { assetDirectoryExists, readAssetFile, writeAssetFile } from './fileUtils';

export async function prepareContentPage(
  bookLoader: ReturnType<AppServices['archiveLoader']['book']>,
  bookSlug: string,
  pageId: string
) {
  const book = await bookLoader.load();
  const page = await bookLoader.page(pageId).load();

  const action: Match<typeof content> = {
    params: {
      book: bookSlug,
      page: getUrlParamForPageId(book, page.id),
    },
    route: content,
    state: {
      bookUid: book.id,
      bookVersion: book.version,
      pageUid: page.id,
    },
  };

  console.info(`prepared ${matchUrl(action)}`); // tslint:disable-line:no-console

  return action;
}

const indexHtml = readAssetFile('index.html');

const prepareApp = async(
  services: AppOptions['services'],
  action: AnyMatch,
  expectedCode: number
) => {
  const url = matchUrl(action);
  const app = createApp({initialEntries: [action], services});

  await app.services.promiseCollector.calm();

  const state = app.store.getState();
  const styles = new ServerStyleSheet();
  const pathname = navigationSelectors.pathname(state);

  if (pathname !== url) {
    throw new Error(`UNSUPPORTED: url: ${url} caused a redirect.`);
  }
  if (errorSelectors.code(state) !== expectedCode) {
    throw new Error(`UNSUPPORTED: url: ${url} expected code ${expectedCode}, got ${errorSelectors.code(state)}`);
  }

  return {app, state, styles, url};
};

type RenderHtml = (styles: ServerStyleSheet, app: ReturnType<typeof createApp>, state: AppState) => string;
const renderHtml: RenderHtml = (styles, app, state) => {
  const modules: string[] = [];

  return injectHTML(indexHtml, {
    body: renderToString(
      <StyleSheetManager sheet={styles.instance}>
        <Loadable.Capture report={(m) => modules.push(m)}>
          <app.container />
        </Loadable.Capture>
      </StyleSheetManager>
    ),
    fonts: app.services.fontCollector.fonts,
    link: headSelectors.link(state),
    meta: headSelectors.meta(state),
    modules,
    state,
    styles,
    title: headSelectors.title(state),
  });
};

const start = (new Date()).getTime();
let numPages = 0;
export const getStats = () => {
  const end = (new Date()).getTime();
  const elapsedTime = end - start;
  const elapsedMinutes = elapsedTime / 1000 / 60;

  return {numPages, elapsedMinutes};
};

type MakeRenderPage = (services: AppOptions['services']) =>
  (action: AnyMatch, expectedCode: number) => Promise<void>;
const makeRenderPage: MakeRenderPage = (services) => async(action, expectedCode) => {
  const {app, styles, state, url} = await prepareApp(services, action, expectedCode);
  console.info(`rendering ${url}`); // tslint:disable-line:no-console
  const html = await renderHtml(styles, app, state);

  numPages++;

  if (assetDirectoryExists(url)) {
    writeAssetFile(path.join(url, 'index.html'), html);
  } else {
    writeAssetFile(url, html);
  }
};

export const prepareBooks = async(
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader']
): Promise<Array<{book: Book, loader: ReturnType<AppServices['archiveLoader']['book']>}>> => {
  return Promise.all(Object.entries(BOOKS).map(async([bookId, {defaultVersion}]) => {
    const bookLoader = archiveLoader.book(bookId, defaultVersion);
    const cmsBook = await osWebLoader.getBookFromId(bookId);
    const archiveBook = await bookLoader.load();

    return {
      book: formatBookData(archiveBook, cmsBook),
      loader: bookLoader,
    };
  }));
};

export type Pages = Array<{code: number, page: AnyMatch}>;

export const prepareErrorPages = (): Promise<Pages> => Promise.resolve([
  {code: 404, page: {route: notFound}},
]);

export const prepareDeveloperPages = (): Promise<Pages> => Promise.resolve(
  process.env.REACT_APP_ENV === 'development'
    ? [{code: 200, page: {route: developerHome}}]
    : []
);

export const prepareBookPages = (
  bookLoader: ReturnType<AppServices['archiveLoader']['book']>,
  book: Book
) => asyncPool(20, findTreePages(book.tree), (section) =>
  prepareContentPage(bookLoader, book.slug, stripIdVersion(section.id))
    .then((page) => ({code: 200, page}))
);

export const getBookSitemap = (
  bookLoader: ReturnType<AppServices['archiveLoader']['book']>,
  pages: Array<{page: Match<typeof content>}>
) => pages.map((record) => {
  const matchState = assertDefined(
    record.page.state,
    'match state wasn\'t defined, it should have been'
  );
  const archivePage = assertDefined(
    bookLoader.page(matchState.pageUid).cached(),
    'page wasn\'t cached, it should have been'
  );

  return {
    changefreq: EnumChangefreq.MONTHLY,
    lastmod: dateFns.format(archivePage.revised, 'YYYY-MM-DD'),
    url: matchUrl(record.page),
  };
});

type RenderPages = (
  services: AppOptions['services'],
  pages: Pages
) => Promise<void>;
export const renderPages: RenderPages = async(services, pages) => {
  const renderPage = makeRenderPage(services);
  await asyncPool(50, pages, ({code, page}) => renderPage(page, code));
};

interface Options {
  body: string;
  styles: ServerStyleSheet;
  fonts: FontCollector['fonts'];
  meta: Meta[];
  link: Link[];
  state: AppState;
  modules: string[];
  title: string;
}
function injectHTML(html: string, {body, styles, state, fonts, meta, link, modules, title}: Options) {

  const assetManifest = JSON.parse(readAssetFile('asset-manifest.json'));

  const extractAssets = () => Object.keys(assetManifest)
    .filter((asset) => modules.indexOf(asset.replace('.js', '')) > -1)
    .map((k) => assetManifest[k]);

  const scripts = extractAssets().map(
    (c) => `<script type="text/javascript" src="${c}"></script>`
  );

  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

  html = html.replace('</head>',
    fonts.map((font) => `<link rel="stylesheet" href="${font}">`).join('') +
    meta.map(
      (tag) => `<meta ${Object.entries(tag).map(([name, value]) => `${name}="${value}"`).join(' ')} />`).join(''
    ) +
    link.map(
      (tag) => `<link ${Object.entries(tag).map(([name, value]) => `${name}="${value}"`).join(' ')} />`).join(''
    ) +
    styles.getStyleTags() +
    '</head>'
  );
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${body}</div>` +
    `<script>window.__PRELOADED_STATE__ = ${JSON.stringify(state).replace(/</g, '\\u003c')}</script>`
  );

  html = html.replace(/(<script src="[^"]+\.chunk\.js"><\/script>)/, scripts.join('') + '$1');

  return html;
}
