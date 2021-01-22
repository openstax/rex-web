import { ApplicationError } from '../../../../helpers/applicationMessageError';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, page } from '../../../../test/mocks/archiveLoader';
import mockHighlight from '../../../../test/mocks/highlight';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { testAccountsUser } from '../../../../test/mocks/userLoader';
import { receivePageFocus } from '../../../actions';
import { receiveUser } from '../../../auth/actions';
import { formatUser } from '../../../auth/utils';
import { locationChange } from '../../../navigation/actions';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import { receiveHighlights } from '../actions';
import { HighlightData } from '../types';

const mockConfig = {BOOKS: {
 [book.id]: {defaultVersion: book.version},
} as {[key: string]: {defaultVersion: string}}};

jest.doMock('../../../../config', () => mockConfig);

describe('locationChange', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./locationChange').default>;

  beforeEach(() => {
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./locationChange').default)(helpers);
  });

  it('noops with no book', () => {
    store.dispatch(receivePage({...page, references: []}));
    const getHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights');

    hook();

    expect(getHighlights).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops with no page', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    const getHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights');

    hook();

    expect(getHighlights).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops with no pageFocus action', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    const getHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights');

    store.dispatch(receiveUser(formatUser(testAccountsUser)));

    const mock = mockHighlight();
    const highlights = [{id: mock.id} as HighlightData];
    store.dispatch(receiveHighlights({highlights, pageId: page.id}));

    hook(locationChange({action: 'PUSH', location: {} as any}));

    expect(getHighlights).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops when focus is leaving', () => {
    const mock = mockHighlight();
    const highlights = [{id: mock.id} as HighlightData];

    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));
    store.dispatch(receiveHighlights({highlights, pageId: page.id}));

    const getHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights');

    hook(receivePageFocus(false));

    expect(getHighlights).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops when highlights for specific page are already loading', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));
    store.dispatch(receiveHighlights({highlights: [], pageId: page.id}));

    const getHighlights = jest.spyOn(helpers.highlightClient, 'getHighlights');

    await hook();

    expect(getHighlights).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('receives highlights', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));

    const mock = mockHighlight();
    const highlights = [{id: mock.id} as HighlightData];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValue(Promise.resolve({data: highlights, meta: {perPage: 200, page: 1, totalCount: 1}}));

    await hook();

    expect(dispatch).toHaveBeenCalledWith(receiveHighlights({highlights, pageId: page.id}));
  });

  it('receives multiple pages of highlights', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveUser(formatUser(testAccountsUser)));

    const highlights1 = [{id: mockHighlight().id} as HighlightData];
    const highlights2 = [{id: mockHighlight().id} as HighlightData];
    const highlights = [...highlights1, ...highlights2];

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValueOnce(Promise.resolve({data: highlights1, meta: {perPage: 1, page: 1, totalCount: 2}}))
      .mockReturnValueOnce(Promise.resolve({data: highlights2, meta: {perPage: 1, page: 2, totalCount: 2}}))
      .mockReturnValue(Promise.resolve({}))
    ;

    await hook();

    expect(dispatch).toHaveBeenCalledWith(receiveHighlights({highlights, pageId: page.id}));
  });

  describe('error handling', () => {
    it('doesn\'t throw HighlightLoadError if hook ran because of page\'s focus changing', async() => {
      expect.assertions(4);

      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({...page, references: []}));
      store.dispatch(receiveUser(formatUser(testAccountsUser)));

      dispatch.mockClear();

      jest.spyOn(helpers.highlightClient, 'getHighlights')
        .mockRejectedValueOnce({});

      try {
        await hook(receivePageFocus(true));
      } catch (error) {
        expect(error.messageKey).not.toBeDefined();
        expect(error.meta).not.toBeDefined();
      }

      try {
        await hook(receivePageFocus(false));
      } catch (error) {
        expect(error.messageKey).not.toBeDefined();
        expect(error.meta).not.toBeDefined();
      }
    });

    it('throws HighlightLoadError', async() => {
      expect.assertions(2);
      const error = {} as any;
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({...page, references: []}));
      store.dispatch(receiveUser(formatUser(testAccountsUser)));

      dispatch.mockClear();

      jest.spyOn(helpers.highlightClient, 'getHighlights')
        .mockRejectedValueOnce(error);

      try {
        await hook(locationChange({action: 'PUSH', location: {} as any}));
      } catch (error) {
        expect(error.messageKey).toBe(toastMessageKeys.higlights.failure.load);
        expect(error.meta).toEqual({destination: 'page', shouldAutoDismiss: false});
      }
    });

    it('throws ApplicationError', async() => {
      expect.assertions(8);
      const mockCustomApplicationError = new ApplicationError('error');
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({...page, references: []}));
      store.dispatch(receiveUser(formatUser(testAccountsUser)));

      dispatch.mockClear();

      jest.spyOn(helpers.highlightClient, 'getHighlights')
        .mockRejectedValue(mockCustomApplicationError);

      try {
        await hook();
      } catch (error) {
        expect(error instanceof ApplicationError).toEqual(true);
        expect(error.message).toBe(mockCustomApplicationError.message);
      }

      try {
        await hook(receivePageFocus(true));
      } catch (error) {
        expect(error instanceof ApplicationError).toEqual(true);
        expect(error.message).toBe(mockCustomApplicationError.message);
      }

      try {
        await hook(receivePageFocus(false));
      } catch (error) {
        expect(error instanceof ApplicationError).toEqual(true);
        expect(error.message).toBe(mockCustomApplicationError.message);
      }

      try {
        await hook(locationChange({action: 'PUSH', location: {} as any}));
      } catch (error) {
        expect(error instanceof ApplicationError).toEqual(true);
        expect(error.message).toBe(mockCustomApplicationError.message);
      }
    });
  });
});
