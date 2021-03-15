import { AppServices } from '../../src/app/types';

const prepareRedirects = async(
  _archiveLoader: AppServices['archiveLoader'],
  _osWebLoader: AppServices['osWebLoader']
) => {
  // const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);
  const books: string[] = [];
  console.log('books', books)

  const redirects: Array<{ from: string, to: string }> = [];

  return redirects;
};

export default prepareRedirects;
