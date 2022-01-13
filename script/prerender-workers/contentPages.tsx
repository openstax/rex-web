import React from 'react';
import { renderToString } from 'react-dom/server';
import Loadable from 'react-loadable';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components/macro';
import createApp from '../../src/app';
import { AppOptions } from '../../src/app';
import { content } from '../../src/app/content/routes';
import * as contentSelectors from '../../src/app/content/selectors';
import { BookWithOSWebData } from '../../src/app/content/types';
import { stripIdVersion } from '../../src/app/content/utils';
import { findTreePages } from '../../src/app/content/utils/archiveTreeUtils';
import * as errorSelectors from '../../src/app/errors/selectors';
import * as headSelectors from '../../src/app/head/selectors';
import { Link, Meta } from '../../src/app/head/types';
import * as navigationSelectors from '../../src/app/navigation/selectors';
import { AnyMatch } from '../../src/app/navigation/types';
import { matchPathname } from '../../src/app/navigation/utils';
import { AppState } from '../../src/app/types';
import { assertDefined } from '../../src/app/utils';
import FontCollector from '../../src/helpers/FontCollector';
import { readAssetFile } from './fileUtils';

export type BookMatch = {
  params: { book: { slug: string } },
  route: typeof content,
  state: { bookUid: string, bookVersion: string },
};
export type SerializedBookMatch = Omit<BookMatch, 'route'>;

export function deserializeBook(book: SerializedBookMatch) {
  return {...book, route: content};
}

export type PageMatch = {
  params: { book: { slug: string }, page: { slug: string } },
  route: typeof content,
  state: { bookUid: string, bookVersion: string, pageUid: string },
};
export type SerializedPageMatch = Omit<PageMatch, 'route'>;

export function deserializePage(page: SerializedPageMatch) {
  return {...page, route: content};
}

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

export const globalMinuteCounter = minuteCounter();

export async function getArchiveBook(services: AppOptions['services'], route: BookMatch) {
  if (!route.state || !('bookUid' in route.state)) {
    throw new Error('match state wasn\'t defined, it should have been');
  }

  const {bookUid, bookVersion} = route.state;

  return assertDefined(
    await services.archiveLoader.book(bookUid, bookVersion).load(),
    'book wasn\'t cached, it should have been'
  );
}

export async function getArchivePage(services: AppOptions['services'], route: PageMatch) {
  if (!route.state || !('bookUid' in route.state)) {
    throw new Error('match state wasn\'t defined, it should have been');
  }

  const {bookUid, bookVersion, pageUid} = route.state;

  return assertDefined(
    await services.archiveLoader.book(bookUid, bookVersion).page(pageUid).load(),
    'page wasn\'t cached, it should have been'
  );
}

export async function renderPage(
  services: AppOptions['services'],
  savePage: (uri: string, content: string) => void,
  code: number,
  route: PageMatch
) {
  const {app, styles, state, url} = await prepareApp(services, route, code);
  console.info(`Rendering ${url}`); // tslint:disable-line:no-console

  const html = await renderHtml(styles, app, state);

  return savePage(url, html);
}

export const prepareBookPages = (book: BookWithOSWebData) => findTreePages(book.tree).map(
  (section) => prepareContentPage(
    book,
    stripIdVersion(section.id),
    assertDefined(section.slug, `Book JSON does not provide a page slug for ${section.id}`)
  )
);

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
