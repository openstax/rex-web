import dateFns from 'date-fns';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Loadable from 'react-loadable';
import { EnumChangefreq } from 'sitemap';
import { SitemapItemOptions } from 'sitemap';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components/macro';
import asyncPool from 'tiny-async-pool';
import createApp from '../../src/app';
import { AppOptions } from '../../src/app';
import { content } from '../../src/app/content/routes';
import * as contentSelectors from '../../src/app/content/selectors';
import { BookWithOSWebData } from '../../src/app/content/types';
import { makeUnifiedBookLoader, stripIdVersion } from '../../src/app/content/utils';
import { findTreePages } from '../../src/app/content/utils/archiveTreeUtils';
import * as errorSelectors from '../../src/app/errors/selectors';
import * as headSelectors from '../../src/app/head/selectors';
import { Link, Meta } from '../../src/app/head/types';
import * as navigationSelectors from '../../src/app/navigation/selectors';
import { AnyMatch } from '../../src/app/navigation/types';
import { matchPathname } from '../../src/app/navigation/utils';
import { AppServices, AppState } from '../../src/app/types';
import { assertDefined } from '../../src/app/utils';
import BOOKS from '../../src/config.books';
import FontCollector from '../../src/helpers/FontCollector';
import { getArchivePage, PageMatch } from './contentRoutes';
import { assetDirectoryExists, readAssetFile, writeAssetFile } from './fileUtils';

export const stats = {
  promiseCollector: 0,
  renderHtml: 0,
};

// Note: Could return a SerializedPageMatch instead if single-instance prerender code is removed

export function prepareContentPage(
  book: BookWithOSWebData,
  pageId: string,
  pageSlug: string
) {
  const action: PageMatch = {
    params: {
      book: {
        slug: book.slug,
      },
      page: {
        slug: pageSlug,
      },
    },
    route: content,
    state: {
      bookUid: book.id,
      bookVersion: book.version,
      pageUid: pageId,
    },
  };

  return action;
}

const indexHtml = readAssetFile('index.html');

const prepareApp = async(
  services: AppOptions['services'],
  action: AnyMatch,
  expectedCode: number
) => {
  const url = decodeURI(matchPathname(action));
  const app = createApp({initialEntries: [action], services});

  const timer = minuteCounter();
  await app.services.promiseCollector.calm();
  stats.promiseCollector += timer();

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
    links: headSelectors.links(state),
    meta: headSelectors.meta(state),
    modules,
    state,
    styles,
    title: headSelectors.title(state),
  });
};

export const minuteCounter = () => {
  const start = (new Date()).getTime();
  return () => {
    const end = (new Date()).getTime();
    const elapsedTime = end - start;
    const elapsedMinutes = elapsedTime / 1000 / 60;

    return elapsedMinutes;
  };
};

let numPages = 0;
export const globalMinuteCounter = minuteCounter();
export const getStats = () => {
  const elapsedMinutes = globalMinuteCounter();
  return {numPages, elapsedMinutes};
};

export async function renderAndSavePage(
  services: AppOptions['services'],
  savePage: (uri: string, content: string) => void,
  code: number,
  route: PageMatch
) {
  const {app, styles, state, url} = await prepareApp(services, route, code);
  console.info(`Rendering ${url}`); // tslint:disable-line:no-console

  const html = await renderHtml(styles, app, state);

  await savePage(url, html);

  return url;
}

// Note: savePageAsset() and makeRenderPage() are used only by the single-instance prerender code

function savePageAsset(url: string, html: string) {
  if (assetDirectoryExists(url)) {
    writeAssetFile(path.join(url, 'index.html'), html);
  } else {
    writeAssetFile(url, html);
  }
}

type MakeRenderPage = (services: AppOptions['services']) =>
  ({code, route}: {route: PageMatch, code: number}) => Promise<SitemapItemOptions>;

const makeRenderPage: MakeRenderPage = (services) => async({code, route}) => {

  const archivePage = await getArchivePage(services, route);

  // Note: stat collection in memory does not work with multi-instance prerender code
  const timer = minuteCounter();
  const url = await renderAndSavePage(services, savePageAsset, code, route);
  stats.renderHtml += timer();

  numPages++;

  return {
    changefreq: EnumChangefreq.MONTHLY,
    lastmod: dateFns.format(archivePage.revised, 'YYYY-MM-DD'),
    url: encodeURI(url),
  };
};

export const prepareBooks = async(
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader']
): Promise<BookWithOSWebData[]> => {
  return Promise.all(Object.entries(BOOKS).map(async([bookId, {defaultVersion}]) => {
    const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);
    return await bookLoader(bookId, defaultVersion);
  }));
};

// Note: Could return Array<SerializedPageMatch> if single-instance prerender code is removed

export type Pages = Array<{code: number, route: PageMatch}>;

export const prepareBookPages = (book: BookWithOSWebData) => findTreePages(book.tree).map(
  (section) => ({code: 200, route: prepareContentPage(
    book,
    stripIdVersion(section.id),
    assertDefined(section.slug, `Book JSON does not provide a page slug for ${section.id}`)
  )})
);

// Note: renderPages() is used only by the single-instance prerender code

export const renderPages = async(services: AppOptions['services'], pages: Pages) => {
  const renderPage = makeRenderPage(services);
  return await asyncPool(1, pages, renderPage);
};

interface Options {
  body: string;
  styles: ServerStyleSheet;
  fonts: FontCollector['fonts'];
  meta: Meta[];
  links: Link[];
  state: AppState;
  modules: string[];
  title: string;
}
function injectHTML(html: string, {body, styles, state, fonts, meta, links, modules, title}: Options) {

  const assetManifest = JSON.parse(readAssetFile('asset-manifest.json'));
  const book = assertDefined(contentSelectors.book(state), 'book not loaded');

  /*
   * separate chunks are automatically made for vendor code
   * (https://facebook.github.io/create-react-app/docs/production-build)
   *
   * Loadable.preloadReady() only waits for the react-loadable chunks,
   * apparently some of those are triggering the load of some of the
   * numbered chunks and pre-rendering breaks as it waits for them
   * to download.
   *
   * i'm not aware of any way to tell which ones we need ahead of time
   * and render script tags for them here, so we're just loading all
   * the numbered chunks.
   *
   * it would probably be better to wait for completion of any chunks
   * that are requested dynamically, but i'm not seeing a way in
   * webpack's api to do that.
   */
  const extractAssets = () => Object.keys(assetManifest.files)
    .filter((asset) =>
      // chunks requested by react-loadable
      modules.indexOf(asset.replace('.js', '')) > -1
      // all numbered chunks
      || asset.match(/static\/js\/[0-9]+.[0-9a-z]+.chunk.js$/)
    )
    .map((k) => assetManifest.files[k]);

  const scripts = extractAssets().map(
    (c) => `<script type="text/javascript" src="${c}"></script>`
  );

  html = html.replace(/<html/, `<html lang="${book.language}"`);

  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

  html = html.replace('</head>',
    fonts.map((font) => `<link rel="stylesheet" href="${font}">`).join('') +
    meta.map(
      (tag) => `<meta data-rex-page ${Object.entries(tag).map(([name, value]) => `${name}="${value}"`).join(' ')} />`
    ).join('') +
    links.map(
      (tag) => `<link data-rex-page ${Object.entries(tag).map(([name, value]) => `${name}="${value}"`).join(' ')} />`
    ).join('') +
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
