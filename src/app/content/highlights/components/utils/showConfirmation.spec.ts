import ReactDOM from 'react-dom';
import createTestServices from '../../../../../test/createTestServices';
import createTestStore from '../../../../../test/createTestStore';
import { book as archiveBook } from '../../../../../test/mocks/archiveLoader';
import { resetModules } from '../../../../../test/utils';
import { mockCmsBook } from '../../../..//../test/mocks/osWebLoader';
import { AppServices, MiddlewareAPI, Store } from '../../../../types';
import { assertDocument } from '../../../../utils';
import { receiveBook } from '../../../actions';
import { formatBookData } from '../../../utils';
import showConfirmation from './showConfirmation';

const book = formatBookData(archiveBook, mockCmsBook);

jest.mock('../ConfirmationModal', () => jest.fn()
  .mockImplementationOnce(({ confirm }) => {
    confirm();
    return null;
  })
  .mockImplementationOnce(({ deny }) => {
    deny();
    return null;
  })
  .mockImplementationOnce(({ deny }) => {
    setTimeout(deny, 300);
    return null;
  })
);

const rootNode = (() => {
  const mockNode = assertDocument().createElement('div');
  mockNode.id = 'root';
  return mockNode;
})();

const modalNode = assertDocument().createElement('div');

describe('ShowConfirmation', () => {
  let createElement: jest.SpyInstance;
  let render: jest.SpyInstance;
  let unmount: jest.SpyInstance;
  let services: AppServices & MiddlewareAPI;
  let store: Store;

  beforeEach(() => {
    resetModules();
    jest.clearAllMocks();

    const document = assertDocument();
    document.body.innerHTML = '';
    document.body.appendChild(rootNode);

    rootNode.insertAdjacentElement = jest.fn().mockImplementation(() => {
      document.body.appendChild(modalNode);
    });

    render = jest.spyOn(ReactDOM, 'render');
    unmount = jest.spyOn(ReactDOM, 'unmountComponentAtNode');

    createElement = jest.spyOn(document, 'createElement').mockImplementation(() => modalNode);
    store = createTestStore();
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };
  });

  it('unmounts on confirmation', async() => {
    store.dispatch(receiveBook(book));
    const answer = await showConfirmation(services);

    expect(answer).toBe(true);
    expect(createElement).toHaveBeenCalledWith('div');
    expect(render).toHaveBeenCalledWith(expect.anything(), modalNode);
    expect(rootNode.insertAdjacentElement).toHaveBeenCalledWith('afterend', modalNode);
    expect(unmount).toHaveBeenCalledWith(modalNode);
  });

  it('unmounts on denial', async() => {
    store.dispatch(receiveBook(book));
    const answer = await showConfirmation(services);

    expect(answer).toBe(false);
    expect(unmount).toHaveBeenCalledWith(modalNode);
  });
});
