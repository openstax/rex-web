import { BuyPrintResponse } from '../../../../gateways/createBuyPrintConfigLoader';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receiveBuyPrintConfig } from '../../actions';
import { formatBookData } from '../../utils';
import loadBuyPrintConfig from './buyPrintConfig';

const book = formatBookData(archiveBook, mockCmsBook);

describe('loadBuyPrintConfig', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;

  beforeEach(() => {
    jest.resetAllMocks();
    store = createTestStore();
    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

  });

  it('noops without book', async() => {
    const hook = loadBuyPrintConfig(helpers);
    const load = jest.spyOn(helpers.buyPrintConfigLoader, 'load');
    await hook();
    expect(load).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches on success', async() => {
    store.dispatch(receiveBook(book));
    jest.resetAllMocks();
    const hook = loadBuyPrintConfig(helpers);
    const load = jest.spyOn(helpers.buyPrintConfigLoader, 'load');

    const config = {url: 'someurl', disclosure: 'some disclosure'};

    load.mockReturnValue(Promise.resolve({buy_urls: [config]} as BuyPrintResponse));

    await hook();

    expect(load).toHaveBeenCalledWith(book);
    expect(dispatch).toHaveBeenCalledWith(receiveBuyPrintConfig(config));
  });
});
