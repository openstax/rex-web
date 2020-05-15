import fetch from 'node-fetch';
import { makeUnifiedBookLoader } from '../../src/app/content/utils';
import { assertDefined } from '../../src/app/utils';
import config from '../../src/config';
import createArchiveLoader from '../../src/gateways/createArchiveLoader';
import createOSWebLoader from '../../src/gateways/createOSWebLoader';

export async function findBooks({
  rootUrl,
  archiveUrl,
  bookId,
  bookVersion,
}: {
  rootUrl: string,
  archiveUrl?: string,
  bookId?: string,
  bookVersion?: string,
}) {
  // Get the book config whether the server is prerendered or dev mode
  const bookConfig: typeof config.BOOKS = await fetch(`${rootUrl}/rex/release.json`)
    .then((response) => response.json())
    .then((json) => json.books)
    .catch(() => config.BOOKS)
  ;

  (global as any).fetch = fetch;
  const archiveLoader = createArchiveLoader(`${archiveUrl ? archiveUrl : rootUrl}${config.REACT_APP_ARCHIVE_URL}`);
  const osWebLoader = createOSWebLoader(`${rootUrl}${config.REACT_APP_OS_WEB_API_URL}`);
  const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);

  const bookInfo = bookId
    ? [{id: bookId, version: bookVersion || assertDefined(bookConfig[bookId], '').defaultVersion}]
    : Object.entries(bookConfig).map(([id, {defaultVersion}]) => ({id, version: defaultVersion}))
  ;

  return await Promise.all(bookInfo.map(({id, version}) => bookLoader(id, version)));
}
