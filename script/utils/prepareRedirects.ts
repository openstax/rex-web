import fs from 'fs';
import path from 'path';
import { RedirectsData } from '../../data/redirects/types';
import { content } from '../../src/app/content/routes';
import { makeUnifiedBookLoader } from '../../src/app/content/utils';
import { findArchiveTreeNodeById } from '../../src/app/content/utils/archiveTreeUtils';
import { AppServices } from '../../src/app/types';
import { APP_ENV, BOOKS } from '../../src/config';

const redirectsDataFolderPath = path.resolve(__dirname, '../../data/redirects/');

const redirectsDataFiles = APP_ENV === 'test'
  ? [path.resolve(__dirname, '../../src/mock-redirects.json')]
  : fs.readdirSync(redirectsDataFolderPath)
    .filter((name) => name.match('.json'))
    .map((file) => `${redirectsDataFolderPath}/${file}`);

const prepareRedirects = async(
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader']
) => {
  const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);

  const redirects: Array<{ from: string, to: string }> = [];

  for (const fileName of redirectsDataFiles) {
    const bookRedirects: RedirectsData = await import(fileName);

    for (const { bookId, pageId, pathname } of bookRedirects) {
      const configForBook: { defaultVersion: string } | undefined = BOOKS[bookId];

      if (!configForBook) {
        // tslint:disable-next-line: no-console
        console.log(`Couldn't find version for book: ${bookId}`);
        continue;
      }

      const { tree, slug: bookSlug } = await bookLoader(bookId, configForBook.defaultVersion);
      const page = findArchiveTreeNodeById(tree, pageId);

      if (!page) {
        // tslint:disable-next-line: no-console
        console.log(`Couldn't find page ${pageId} in book ${bookId}`);
        continue;
      }

      redirects.push({
        from: pathname,
        to: content.getUrl({ book: { slug: bookSlug }, page: { slug: page.slug } }),
      });
    }
  }

  return redirects;
};

export default prepareRedirects;
