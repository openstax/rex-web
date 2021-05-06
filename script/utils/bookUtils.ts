import https from 'https';
import fetch from 'node-fetch';
import { makeUnifiedBookLoader } from '../../src/app/content/utils';
import { AppServices } from '../../src/app/types';
import { assertDefined } from '../../src/app/utils';
import config from '../../src/config';

export async function findBooks({
  archiveLoader,
  bookId,
  bookVersion,
  osWebLoader,
  rootUrl,
}: {
  archiveLoader: AppServices['archiveLoader'],
  bookId?: string,
  bookVersion?: string,
  osWebLoader: AppServices['osWebLoader']
  rootUrl: string,
}) {
  // Get the book config whether the server is prerendered or dev mode
  const bookConfig: typeof config.BOOKS = await fetch(`${rootUrl}/rex/release.json`)
    .then((response) => response.json())
    .then((json) => json.books)
    .catch(() => config.BOOKS)
  ;

  // this hackery makes it not care about self signed certificates
  const agent = new (https.Agent as any)({
    rejectUnauthorized: false,
  });
  (global as any).fetch = (url: any, options: any) => fetch(url, {...options, agent});

  const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);

  const bookInfo = bookId
    ? [{id: bookId, version: bookVersion || assertDefined(bookConfig[bookId], '').defaultVersion}]
    : Object.entries(bookConfig).map(([id, {defaultVersion}]) => ({id, version: defaultVersion}))
  ;

  return await Promise.all(bookInfo.map(({id, version}) => bookLoader(id, version)));
}
