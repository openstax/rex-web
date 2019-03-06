import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import portfinder from 'portfinder';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
import asyncPool from 'tiny-async-pool';
import createApp from '../../src/app';
import { content } from '../../src/app/content/routes';
import { flattenArchiveTree, getUrlParamForPageId, stripIdVersion } from '../../src/app/content/utils';
import { notFound } from '../../src/app/errors/routes';
import * as errorSelectors from '../../src/app/errors/selectors';
import * as headSelectors from '../../src/app/head/selectors';
import { Meta } from '../../src/app/head/types';
import * as navigationSelectors from '../../src/app/navigation/selectors';
import { AnyMatch, Match } from '../../src/app/navigation/types';
import { matchUrl } from '../../src/app/navigation/utils';
import { AppServices, AppState } from '../../src/app/types';
import {
  BOOKS,
  CODE_VERSION,
  REACT_APP_ARCHIVE_URL,
  REACT_APP_OS_WEB_API_URL,
  RELEASE_ID
} from '../../src/config';
import createArchiveLoader from '../../src/helpers/createArchiveLoader';
import createOSWebLoader from '../../src/helpers/createOSWebLoader';
import FontCollector from '../../src/helpers/FontCollector';
import { startServer } from '../server';

(global as any).fetch = fetch;

const ASSET_DIR = path.resolve(__dirname, '../../build');

const indexHtml = fs.readFileSync(path.resolve(ASSET_DIR, 'index.html'), 'utf8');

async function renderManifest() {
  writeFile(path.join(ASSET_DIR, '/rex/release.json'), JSON.stringify({
    books: BOOKS,
    code: CODE_VERSION,
    id: RELEASE_ID,
  }, null, 2));
}

async function prepareContentPage(
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

type RenderHtml = (styles: ServerStyleSheet, app: ReturnType<typeof createApp>, state: AppState) => string;
const renderHtml: RenderHtml = (styles, app, state) => injectHTML(indexHtml, {
  body: renderToString(
     <StyleSheetManager sheet={styles.instance}>
       <app.container />
     </StyleSheetManager>
  ),
  fonts: app.services.fontCollector.fonts,
  meta: headSelectors.meta(state),
  state,
  styles,
});

type MakeRenderPage = (services: Pick<AppServices, 'archiveLoader' | 'osWebLoader'>) =>
  (action: AnyMatch, expectedCode: number) => Promise<void>;
const makeRenderPage: MakeRenderPage = (services) => async(action, expectedCode) => {
  const url = matchUrl(action);
  console.info(`rendering ${url}`); // tslint:disable-line:no-console
  const app = createApp({initialEntries: [action], services});

  await app.services.promiseCollector.calm();

  const state = app.store.getState();
  const styles = new ServerStyleSheet();
  const pathname = navigationSelectors.pathname(state);

  if (pathname !== url) {
    throw new Error(`UNSUPPORTED: url: ${url} caused a redirect.`);
  }
  if (errorSelectors.code(state) !== expectedCode) {
    throw new Error(`UNSUPPORTED: url: ${url} has an unexpected response code.`);
  }

  const html = renderHtml(styles, app, state);

  writeFile(path.join(ASSET_DIR, url), html);
};

type Pages = Array<{code: number, page: AnyMatch}>;
type PreparePages = (
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader']
) => Promise<Pages>;
const preparePages: PreparePages = async(archiveLoader, osWebLoader) => {
  const bookEntries = Object.entries(BOOKS);

  const pages: Pages = [
    {code: 404, page: {route: notFound}},
  ];

  for (const [bookId, {defaultVersion}] of bookEntries) {
    const bookLoader = archiveLoader.book(bookId, defaultVersion);
    const bookSlug = await osWebLoader.getBookSlugFromId(bookId);
    const book = await bookLoader.load();

    await asyncPool(20, flattenArchiveTree(book.tree), (section) =>
      prepareContentPage(bookLoader, bookSlug, stripIdVersion(section.id))
        .then((page) => pages.push({code: 200, page}))
    );
  }

  return pages;
};

type RenderPages = (
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader'],
  pages: Pages
) => Promise<void>;
const renderPages: RenderPages = async(archiveLoader, osWebLoader, pages) => {
  const renderPage = makeRenderPage({osWebLoader, archiveLoader});
  await asyncPool(50, pages, ({code, page}) => renderPage(page, code));
};

async function render() {
  const start = (new Date()).getTime();
  const port = await portfinder.getPortPromise();
  const archiveLoader = createArchiveLoader(`http://localhost:${port}${REACT_APP_ARCHIVE_URL}`);
  const osWebLoader = createOSWebLoader(`http://localhost:${port}${REACT_APP_OS_WEB_API_URL}`);
  const {server} = await startServer({port, onlyProxy: true});

  const pages = await preparePages(archiveLoader, osWebLoader);

  await renderManifest();
  await renderPages(archiveLoader, osWebLoader, pages);

  const numPages = pages.length;
  const end = (new Date()).getTime();
  const elapsedTime = end - start;
  const elapsedMinutes = elapsedTime / 1000 / 60;

  // tslint:disable-next-line:no-console max-line-length
  console.log(`Prerender complete. Rendered ${numPages} pages, ${numPages / elapsedMinutes}ppm`);

  server.close();
}

render().catch((e) => {
  console.error(e.message); // tslint:disable-line:no-console
  process.exit(1);
});

interface Options {
  body: string;
  styles: ServerStyleSheet;
  fonts: FontCollector['fonts'];
  meta: Meta[];
  state: AppState;
}
function injectHTML(html: string, {body, styles, state, fonts, meta}: Options) {
  html = html.replace('</head>',
    fonts.map((font) => `<link rel="stylesheet" href="${font}">`).join('') +
    meta.map(
      (tag) => `<meta ${Object.entries(tag).map(([name, value]) => `${name}="${value}"`).join(' ')} />`).join(''
    ) +
    styles.getStyleTags() +
    '</head>'
  );
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${body}</div>` +
    `<script>window.__PRELOADED_STATE__ = ${JSON.stringify(state).replace(/</g, '\\u003c')}</script>`
  );

  return html;
}

function makeDirectories(filepath: string) {
  const dirname = path.dirname(filepath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  makeDirectories(dirname);
  fs.mkdirSync(dirname);
}

function writeFile(filepath: string, contents: string) {
  makeDirectories(filepath);
  fs.writeFile(filepath, contents, () => null);
}
