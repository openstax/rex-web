import fs from 'fs';
import path from 'path';
import { RedirectsData } from '../../data/redirects/types';
import { content } from '../../src/app/content/routes';
import { makeUnifiedBookLoader } from '../../src/app/content/utils';
import { findArchiveTreeNodeById } from '../../src/app/content/utils/archiveTreeUtils';
import { AppServices } from '../../src/app/types';
import { APP_ENV } from '../../src/config';
import { getBooksConfigSync } from '../../src/gateways/createBookConfigLoader';

const redirectsDataFolderPath = path.resolve(__dirname, '../../data/redirects/');

const booksConfig = getBooksConfigSync();

const redirectsDataFiles = APP_ENV === 'test'
  ? [path.resolve(__dirname, '../../src/mock-redirects.json')]
  : fs.readdirSync(redirectsDataFolderPath)
      .filter((name) => name.match('.json'))
      .map((file) => `${redirectsDataFolderPath}/${file}`);

const prepareRedirects = async(
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader']
) => {
  const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader, {booksConfig});

  const redirects: Array<{ from: string, to: string }> = [];

  for (const fileName of redirectsDataFiles) {
    const bookRedirects: RedirectsData = (await import(fileName)).default;
    const oldBookSlugsRedirected = new Set<string>();

    for (const { bookId, pageId, pathname, query } of bookRedirects) {
      const { tree, slug: bookSlug } = await bookLoader(bookId);
      const page = findArchiveTreeNodeById(tree, pageId);

      if (!page) {
        console.log(`Couldn't find page ${pageId} in book ${bookId}`);
        continue;
      }

      redirects.push({
        from: pathname,
        to: decodeURI(content.getUrl({ book: { slug: bookSlug }, page: { slug: page.slug } })) + (query || ''),
      });

      if (!pathname.endsWith('/')) {
        redirects.push({
          from: `${pathname}/`,
          to: pathname,
        });
      }

      // also redirect the bare book url (no page) for any old slug referenced by this file,
      // so links like /books/<old-slug> land on the book's current bare book url instead of 404ing
      const oldBookSlug = pathname.match(/^\/books\/([^/]+)\//)?.[1];
      if (oldBookSlug && oldBookSlug !== bookSlug && !oldBookSlugsRedirected.has(oldBookSlug)) {
        oldBookSlugsRedirected.add(oldBookSlug);
        redirects.push(
          { from: `/books/${oldBookSlug}`, to: `/books/${bookSlug}` },
          { from: `/books/${oldBookSlug}/`, to: `/books/${bookSlug}` }
        );
      }
    }
  }

  for (const [bookId] of Object.entries(booksConfig.books)) {
    const slug = await osWebLoader.getBookSlugFromId(bookId);
    redirects.push({
      from: `/books/${slug}`,
      to: `/details/books/${slug}`,
    },
    {
      from: `/books/${slug}/`,
      to: `/details/books/${slug}`,
    });
  }

  // a retired/renamed book's old slug can collide with the generic "current book" redirects above
  // (e.g. a retired book still gets a /details/books/ redirect for its own old slug); keep the first
  // occurrence of each `from`, since the more specific per-book redirects are pushed first
  const seenFrom = new Set<string>();
  return redirects.filter(({ from }) => {
    if (seenFrom.has(from)) {
      return false;
    }
    seenFrom.add(from);
    return true;
  });
};

export default prepareRedirects;
