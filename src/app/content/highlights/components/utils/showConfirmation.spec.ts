
import ReactDOM from 'react-dom';
import showConfirmation from './showConfirmation';

import { assertDocument } from '../../../../utils';

jest.mock('../ConfirmationModal', () => {
  return {
    __esModule: true,
    default: jest.fn()
      .mockImplementationOnce(({ confirm }) => {
        confirm();
        return null;
      })
      .mockImplementationOnce(({ deny }) => {
        deny();
        return null;
      }),
  };
});

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
  let document: ReturnType<typeof assertDocument>;
  beforeEach(() => {
    document = assertDocument();
    document.body.innerHTML = '';
    document.body.appendChild(rootNode);

    rootNode.insertAdjacentElement = jest.fn().mockImplementation(() => {
      document.body.appendChild(modalNode);
    });

    render = jest.spyOn(ReactDOM, 'render');
    unmount = jest.spyOn(ReactDOM, 'unmountComponentAtNode');

    createElement = jest.spyOn(document, 'createElement').mockImplementation(() => modalNode);
  });

  it('unmounts on confirmation', async() => {
    const answer = await showConfirmation();

    expect(answer).toBe(true);
    expect(createElement).toHaveBeenCalledWith('div');
    expect(render).toHaveBeenCalledWith(expect.anything(), modalNode);
    expect(rootNode.insertAdjacentElement).toHaveBeenCalledWith('afterend', modalNode);
    expect(unmount).toHaveBeenCalledWith(modalNode);
  });

  it('unmounts on denial', async() => {
    const answer = await showConfirmation();

    expect(answer).toBe(false);
    expect(unmount).toHaveBeenCalledWith(modalNode);
  });
});
