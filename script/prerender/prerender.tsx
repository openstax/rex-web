import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import portfinder from 'portfinder';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Loadable from 'react-loadable';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components/macro';
import asyncPool from 'tiny-async-pool';
import createApp from '../../src/app';
import { AppOptions } from '../../src/app';
import { content } from '../../src/app/content/routes';
import { getUrlParamForPageId, stripIdVersion } from '../../src/app/content/utils';
import { findTreePages } from '../../src/app/content/utils/archiveTreeUtils';
import { developerHome } from '../../src/app/developer/routes';
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
  REACT_APP_ACCOUNTS_URL,
  REACT_APP_ARCHIVE_URL,
  REACT_APP_OS_WEB_API_URL,
  RELEASE_ID
} from '../../src/config';
import createArchiveLoader from '../../src/gateways/createArchiveLoader';
import createOSWebLoader from '../../src/gateways/createOSWebLoader';
import createSearchClient from '../../src/gateways/createSearchClient';
import createUserLoader from '../../src/gateways/createUserLoader';
import FontCollector from '../../src/helpers/FontCollector';
import { startServer } from '../server';

(global as any).fetch = fetch;

const ASSET_DIR = path.resolve(__dirname, '../../build');

const assetManifest = JSON.parse(fs.readFileSync(path.resolve(ASSET_DIR, 'asset-manifest.json'), 'utf8'));
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
    meta: headSelectors.meta(state),
    modules,
    state,
    styles,
    title: headSelectors.title(state),
  });
};

type MakeRenderPage = (services: AppOptions['services']) =>
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
    throw new Error(`UNSUPPORTED: url: ${url} expected code ${expectedCode}, got ${errorSelectors.code(state)}`);
  }

  const html = renderHtml(styles, app, state);

  const filePath = path.join(ASSET_DIR, url);

  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
    writeFile(path.join(filePath, 'index.html'), html);
  } else {
    writeFile(filePath, html);
  }
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

  if (process.env.REACT_APP_ENV === 'development') {
    pages.push({code: 200, page: {route: developerHome}});
  }

  for (const [bookId, {defaultVersion}] of bookEntries) {
    const bookLoader = archiveLoader.book(bookId, defaultVersion);
    const bookSlug = await osWebLoader.getBookSlugFromId(bookId);
    const book = await bookLoader.load();

    await asyncPool(20, findTreePages(book.tree), (section) =>
      prepareContentPage(bookLoader, bookSlug, stripIdVersion(section.id))
        .then((page) => pages.push({code: 200, page}))
    );
  }

  return pages;
};

type RenderPages = (
  services: AppOptions['services'],
  pages: Pages
) => Promise<void>;
const renderPages: RenderPages = async(services, pages) => {
  const renderPage = makeRenderPage(services);
  await asyncPool(50, pages, ({code, page}) => renderPage(page, code));
};

async function render() {
  await Loadable.preloadAll();
  const start = (new Date()).getTime();
  const port = await portfinder.getPortPromise();
  const archiveLoader = createArchiveLoader(`http://localhost:${port}${REACT_APP_ARCHIVE_URL}`);
  const osWebLoader = createOSWebLoader(`http://localhost:${port}${REACT_APP_OS_WEB_API_URL}`);
  const userLoader = createUserLoader(`http://localhost:${port}${REACT_APP_ACCOUNTS_URL}`);
  const searchClient = createSearchClient(`http://localhost:${port}`);
  const {server} = await startServer({port, onlyProxy: true});

  const pages = await preparePages(archiveLoader, osWebLoader);

  await renderManifest();
  await renderPages({archiveLoader, osWebLoader, userLoader, searchClient}, pages);

  const numPages = pages.length;
  const end = (new Date()).getTime();
  const elapsedTime = end - start;
  const elapsedMinutes = elapsedTime / 1000 / 60;

  // tslint:disable-next-line:no-console max-line-length
  console.log(`Prerender complete. Rendered ${numPages} pages, ${numPages / elapsedMinutes}ppm`);

  server.close();
}

render().catch((e) => {
  console.error(e.message, e.stack); // tslint:disable-line:no-console
  process.exit(1);
});

interface Options {
  body: string;
  styles: ServerStyleSheet;
  fonts: FontCollector['fonts'];
  meta: Meta[];
  state: AppState;
  modules: string[];
  title: string;
}
function injectHTML(html: string, {body, styles, state, fonts, meta, modules, title}: Options) {

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
