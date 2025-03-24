import https from 'https';
import fetch from 'node-fetch';
import { makeUnifiedBookLoader } from '../../src/app/content/utils';
import { AppServices } from '../../src/app/types';
import { tuple } from '../../src/app/utils';
import { BooksConfig } from '../../src/gateways/createBookConfigLoader';
import asyncPool from 'tiny-async-pool';

const MAX_CONCURRENT_BOOKS = 5;

export async function findBooks({
  rootUrl,
  archiveLoader,
  osWebLoader,
  bookId,
  bookVersion,
}: {
  rootUrl: string,
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader']
  bookId?: string,
  bookVersion?: string,
}) {
  // Get the book config whether the server is prerendered or dev mode
  const booksConfig = await fetch(`${rootUrl}/rex/release.json`)
    .then((response) => response.json() as Promise<BooksConfig>)
  ;

  // this hackery makes it not care about self signed certificates
  const agent = new (https.Agent as any)({
    rejectUnauthorized: false,
  });
  (global as any).fetch = (url: any, options: any) => fetch(url, {...options, agent});

  const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader, {booksConfig});

  const bookInfo = bookId
    ? [tuple(bookId, bookVersion ? {contentVersion: bookVersion} : undefined)]
    : Object.entries(booksConfig.books)
      .filter(([, book]) => !book.retired)
      .map(([id]) => tuple(id, undefined))
  ;

  return await asyncPool(MAX_CONCURRENT_BOOKS, bookInfo, ([id, versions]) => bookLoader(id, versions));
}
