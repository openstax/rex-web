import './setup';

import { format, parseISO } from 'date-fns';
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
import * as contentSelectors from '../../src/app/content/selectors';
import { ArchiveContent, BookWithOSWebData } from '../../src/app/content/types';
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
import { getBooksConfigSync } from '../../src/gateways/createBookConfigLoader';
import FontCollector from '../../src/helpers/FontCollector';
import { deserializePageMatch, getArchivePage, SerializedPageMatch } from './contentRoutes';
import { assetDirectoryExists, readAssetFile, writeAssetFile } from './fileUtils';

export const stats = {
  promiseCollector: 0,
  renderHtml: 0,
};

export function prepareContentPage(
  book: BookWithOSWebData,
  pageId: string,
  pageSlug: string
) {
  const action: SerializedPageMatch = {
    params: {
      book: {
        slug: book.slug,
      },
      page: {
        slug: pageSlug,
      },
    },
    state: {
      bookUid: book.id,
      pageUid: pageId,
    },
  };

  return action;
}

const booksConfig = getBooksConfigSync();

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
  savePage: (uri: string, content: string) => Promise<unknown>,
  code: number,
  serializedMatch: SerializedPageMatch
) {
  const match = deserializePageMatch(serializedMatch);
  const {app, styles, state, url} = await prepareApp(services, match, code);
  console.info(`Rendering ${url}`);

  const html = await renderHtml(styles, app, state);

  await savePage(url, html);

  return url;
}

// Note: savePageAsset(), makeRenderPage() and prepareBooks()
// are used only by the single-instance prerender code

async function savePageAsset(url: string, html: string) {
  if (assetDirectoryExists(url)) {
    writeAssetFile(path.join(url, 'index.html'), html);
  } else {
    writeAssetFile(url, html);
  }
}

export function getSitemapItemOptions(content: ArchiveContent, url: string) {
  return {
    changefreq: EnumChangefreq.MONTHLY,
    lastmod: format(parseISO(content.revised), 'yyyy-MM-dd'),
    url: encodeURI(url),
  };
}

type MakeRenderPage = (services: AppOptions['services']) =>
  (serializedRoute: SerializedPageMatch) => Promise<SitemapItemOptions>;

const makeRenderPage: MakeRenderPage = (services) => async(route) => {

  const archivePage = await getArchivePage(services, route);

  // Note: stat collection in memory does not work with multi-instance prerender code
  const timer = minuteCounter();
  const url = await renderAndSavePage(services, savePageAsset, 200, route);
  stats.renderHtml += timer();

  numPages++;

  return getSitemapItemOptions(archivePage, url);
};

export const prepareBooks = async(
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader']
): Promise<BookWithOSWebData[]> => {
  const bookConfigs = Object.entries(booksConfig.books).filter(([, book]) => !book.retired);
  return Promise.all(bookConfigs.map(async([bookId]) => {
    const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader, {booksConfig});
    return await bookLoader(bookId);
  }));
};

export type Pages = SerializedPageMatch[];

export const prepareBookPages = (book: BookWithOSWebData) => findTreePages(book.tree).map(
  (section) => prepareContentPage(
    book,
    stripIdVersion(section.id),
    assertDefined(section.slug, `Book JSON does not provide a page slug for ${section.id}`)
  )
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
   * there is something coming in from one of the numbered chunks that
   * causes a hydration error/repaint, i'm not sure why or which one
   */
  const extractAssets = () => Object.keys(assetManifest.files)
    .filter((asset) =>
        (
          // chunks requested by react-loadable
          modules.indexOf(asset.replace('.js', '')) > -1
          // all numbered chunks
          || asset.match(/static\/js\/[0-9]+.[0-9a-z]+.chunk.js$/)
        )
        // webpack will have put some of the chunks in the index.html, don't re-add those
        && html.indexOf(`src="${assetManifest.files[asset]}"`) === -1
    )
    .map((k) => assetManifest.files[k]);

  const scripts = extractAssets().map(
    (c) => `<script defer type="text/javascript" src="${c}"></script>`
  );

  html = html.replace(/<html/, `<html lang="${book.language}"`);

  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

  html = html.replace('</head>',
    fonts.map((font) => `<link rel="stylesheet" href="${font}">`).join('') +
    meta.map(
      (tag) => `<meta data-rex-page ${Object.entries(tag).map(([name, value]) => `${name}="${value}"`).join(' ')}>`
    ).join('') +
    links.map(
      (tag) => `<link data-rex-page ${Object.entries(tag).map(([name, value]) => `${name}="${value}"`).join(' ')}>`
    ).join('') +
    styles.getStyleTags() +
    '</head>'
  );
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${body}</div>` +
    `<script>window.__PRELOADED_STATE__ = ${JSON.stringify(state).replace(/</g, '\\u003c')}</script>`
  );

  html = html.replace(/(<script defer="defer" src="[^"]+\.chunk\.js"><\/script>)/, scripts.join('') + '$1');

  return html;
}
