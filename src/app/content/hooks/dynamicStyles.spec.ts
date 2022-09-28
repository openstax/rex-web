import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { resetModules } from '../../../test/utils';
import { locationChange } from '../../navigation/actions';
import { MiddlewareAPI, Store } from '../../types';
import { receiveBook, requestBook, setStylesUrl } from '../actions';
import { BookWithOSWebData } from '../types';
import { formatBookData } from '../utils';

describe('dynamicStyles', () => {
  let combinedBook: BookWithOSWebData;
  let hook: ReturnType<typeof import ('./dynamicStyles').default>;
  let store: Store;
  let loadResource: jest.SpyInstance;
  let dispatch: jest.SpyInstance;
  let helpers: MiddlewareAPI & ReturnType<typeof createTestServices>;

  beforeEach(() => {
    resetModules();

    book.loadOptions.booksConfig.books[book.id].dynamicStyles = true;
    combinedBook = formatBookData(book, mockCmsBook);
    combinedBook.style_href = '../resources/styles/test-styles.css';

    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    loadResource = jest.spyOn(helpers.archiveLoader.mock, 'loadResource');
    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./dynamicStyles').default)(helpers);
  });

  it('fetches styles in content-style param', async() => {
    const stylesUrl = 'https://openstax.org/apps/archive/codeversion/resources/styles/test-styles.css';
    store.dispatch(locationChange({
      action: 'REPLACE',
      location: {
        search: `?content-style=${stylesUrl}`,
      },
    } as any));
    const receiveBookAction = receiveBook(combinedBook);
    store.dispatch(receiveBookAction);

    await hook(receiveBookAction);

    expect(loadResource).toHaveBeenCalledTimes(1);
    expect(loadResource).toHaveBeenCalledWith(stylesUrl);
    expect(dispatch).toHaveBeenCalledWith(setStylesUrl(stylesUrl));
  });

  it('fetches style in book\'s style_href field', async() => {
    const stylesUrl = '/apps/archive/codeversion/resources/styles/test-styles.css';
    const receiveBookAction = receiveBook(combinedBook);
    store.dispatch(receiveBookAction);

    await hook(receiveBookAction);

    expect(loadResource).toHaveBeenCalledTimes(1);
    expect(loadResource).toHaveBeenCalledWith(stylesUrl);
    expect(dispatch).toHaveBeenCalledWith(setStylesUrl(stylesUrl));
  });

  it('noops if no content-style param and (no style_href in book or dynamicStyles is false)', async() => {
    combinedBook.loadOptions.booksConfig.books[combinedBook.id].dynamicStyles = false;
    const receiveBookAction = receiveBook(combinedBook);
    store.dispatch(receiveBookAction);

    await hook(receiveBookAction);

    expect(loadResource).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();

    combinedBook.loadOptions.booksConfig.books[combinedBook.id].dynamicStyles = true;
    delete combinedBook.style_href;

    store.dispatch(receiveBookAction);

    await hook(receiveBookAction);

    expect(loadResource).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops if book is not yet loaded', async() => {
    const receiveBookAction = receiveBook(combinedBook);

    // We don't call store.dispatch(receiveBookAction) in this test

    await hook(receiveBookAction);

    expect(loadResource).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();

    store.dispatch(requestBook({slug: combinedBook.slug}));

    await hook(receiveBookAction);

    expect(loadResource).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
