import { makeUnifiedBookLoader } from '../../src/app/content/utils';
import { AppServices } from '../../src/app/types';

const prepareRedirects = async(
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader']
) => {
  const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);
  console.log('bookLoader', bookLoader)
  const books: string[] = [];
  console.log('books', books)

  const redirects: Array<{ from: string, to: string }> = [];

  return redirects;
};

export default prepareRedirects;
