import fs from 'fs';
import flatten from 'lodash/fp/flatten';
import fetch from 'node-fetch';
import path from 'path';
import portfinder from 'portfinder';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
import createApp from '../src/app';
import { content } from '../src/app/content/routes';
import { ArchiveTree, ArchiveTreeSection } from '../src/app/content/types';
import * as errorSelectors from '../src/app/errors/selectors';
import * as headSelectors from '../src/app/head/selectors';
import { Meta } from '../src/app/head/types';
import * as navigationSelectors from '../src/app/navigation/selectors';
import { AppState } from '../src/app/types';
import createArchiveLoader from '../src/helpers/createArchiveLoader';
import FontCollector from '../src/helpers/FontCollector';
import startServer from './server';

(global as any).fetch = fetch;

const ASSET_DIR = path.resolve(__dirname, '../build');
const BOOKS = JSON.parse(process.env.BOOKS || 'null') as {
  [key: string]: {
    defaultVersion: string;
  };
};
const indexHtml = fs.readFileSync(path.resolve(ASSET_DIR, 'index.html'), 'utf8');

if (!BOOKS) {
  throw new Error('BOOKS must be valid json');
}

async function render() {

  const port = await portfinder.getPortPromise();
  const {server} = await startServer({port, onlyProxy: true});
  const archiveLoader = createArchiveLoader(`http://localhost:${port}/contents/`);

  async function renderManifest() {
    writeFile(path.join(ASSET_DIR, 'release.json'), JSON.stringify({
      books: BOOKS,
      code: process.env.CODE_VERSION,
      id: process.env.RELEASE_ID,
    }, null, 2));
  }

  // book version is currently ignored, and will be until we rejigger the book content
  // routing to preserve long id and version data on navigation
  async function renderContentPage(bookId: string, _bookVersion: string, pageId: string) {
    const book = await archiveLoader.book(bookId);
    const page = await archiveLoader.page(bookId, pageId);

    await renderPage(content.getUrl({
      bookId: book.shortId,
      pageId: page.shortId,
    }));
  }

  async function renderPage(url: string, expectedCode: number = 200) {
    console.info(`running ${url}`); // tslint:disable-line:no-console
    const app = createApp({
      initialEntries: [url],
      services: {
        archiveLoader,
      },
    });

    await app.services.promiseCollector.calm();

    const state = app.store.getState();
    const styles = new ServerStyleSheet();
    const pathname = navigationSelectors.pathname(state);
    const code = errorSelectors.code(state);
    const meta = headSelectors.meta(state);

    if (pathname !== url) {
      throw new Error(`UNSUPPORTED: url: ${url} caused a redirect.`);
    }
    if (code !== expectedCode) {
      throw new Error(`UNSUPPORTED: url: ${url} has an unexpected response code.`);
    }

    const body = renderToString(
       <StyleSheetManager sheet={styles.instance}>
         <app.container />
       </StyleSheetManager>
    );

    const html = injectHTML(indexHtml, {
      body,
      fonts: app.services.fontCollector.fonts,
      meta,
      state,
      styles,
    });

    writeFile(path.join(ASSET_DIR, url), html);
  }

  await renderManifest();

  await renderPage('/errors/404', 404);

  for (const [bookId, {defaultVersion}] of Object.entries(BOOKS)) {
    const book = await archiveLoader.book(bookId);

    for (const section of getPages(book.tree.contents)) {
      await renderContentPage(bookId, defaultVersion, section.id);
    }
  }

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

function getPages(contents: ArchiveTree[]): ArchiveTreeSection[] {
  return flatten(contents.map((section) => flatten(section.contents ? getPages(section.contents) : [section])));
}
