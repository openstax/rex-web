
import ReactDOM from 'react-dom';
import showConfirmation from './showConfirmation';

import { assertDocument } from '../../../../utils';

jest.mock('../DiscardModal', () => {
  return {
    __esModule: true,
    default: mockModal,
  };
});

const rootNode = (() => {
  const mockNode = assertDocument().createElement('div');
  mockNode.id = 'root';
  return mockNode;
})();

function mockModal({onAnswer}: {onAnswer: (answer: boolean) => void}) {
  onAnswer(true);
  return null;
}

const moduleNode = assertDocument().createElement('div');

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
      document.body.appendChild(moduleNode);
    });

    render = jest.spyOn(ReactDOM, 'render');
    unmount = jest.spyOn(ReactDOM, 'unmountComponentAtNode');

    createElement = jest.spyOn(document, 'createElement').mockImplementation(() => moduleNode);
  });

  it('unmounts on answer', async() => {
    await showConfirmation();

    expect(createElement).toHaveBeenCalledWith('div');
    expect(render).toHaveBeenCalledWith(expect.anything(), moduleNode);
    expect(rootNode.insertAdjacentElement).toHaveBeenCalledWith('afterend', moduleNode);
    expect(unmount).toHaveBeenCalledWith(moduleNode);
  });
});
