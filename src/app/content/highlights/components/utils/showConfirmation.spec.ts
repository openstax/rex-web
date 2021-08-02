import ReactDOM from 'react-dom';
import createTestServices from '../../../../../test/createTestServices';
import createTestStore from '../../../../../test/createTestStore';
import { resetModules } from '../../../../../test/utils';
import { initialState } from '../../../reducer';
import { AppServices, MiddlewareAPI } from '../../../../types';
import { assertDocument } from '../../../../utils';
import { clearFocusedHighlight, focusHighlight, setAnnotationChangesPending } from '../../actions';
import { initialState as initialHighlightState } from '../../reducer';
import showConfirmation from './showConfirmation';

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

const focusedHighlight = 'highlightId';

describe('ShowConfirmation', () => {
  let createElement: jest.SpyInstance;
  let render: jest.SpyInstance;
  let unmount: jest.SpyInstance;
  let dispatch: jest.SpyInstance;
  let services: AppServices & MiddlewareAPI;

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

    const store = createTestStore({
      content: {
        ...initialState,
        highlights: {
          ...initialHighlightState,
          currentPage: {
            ...initialHighlightState.currentPage,
            focused: focusedHighlight,
          },
        },
      },
    });
    dispatch = jest.spyOn(store, 'dispatch');
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };
  });

  it('unmounts on confirmation', async() => {
    const answer = await showConfirmation(services);

    expect(dispatch).toHaveBeenCalledWith(clearFocusedHighlight());
    expect(answer).toBe(true);
    expect(createElement).toHaveBeenCalledWith('div');
    expect(render).toHaveBeenCalledWith(expect.anything(), modalNode);
    expect(rootNode.insertAdjacentElement).toHaveBeenCalledWith('afterend', modalNode);
    expect(unmount).toHaveBeenCalledWith(modalNode);
  });

  it('unmounts on denial', async() => {
    const answer = await showConfirmation(services);

    expect(dispatch).toHaveBeenCalledWith(clearFocusedHighlight());
    expect(answer).toBe(false);
    expect(dispatch).toHaveBeenCalledWith(focusHighlight(focusedHighlight));
    expect(dispatch).toHaveBeenCalledWith(setAnnotationChangesPending(true));
    expect(unmount).toHaveBeenCalledWith(modalNode);
  });
});
