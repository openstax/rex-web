import ReactDOM from 'react-dom';
import { resetModules } from '../../../../../test/utils';
import { assertDocument } from '../../../../utils';
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

describe('ShowConfirmation', () => {
  let createElement: jest.SpyInstance;
  let render: jest.SpyInstance;
  let unmount: jest.SpyInstance;

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

  it('resolves all calls with the same value if called few times', async() => {
    const answers = [showConfirmation(), showConfirmation(), showConfirmation()];

    await new Promise((res) => setTimeout(res, 300));
    const [answerA, answerB, answerC] = await Promise.all(answers);

    expect(createElement).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledTimes(1);
    expect(rootNode.insertAdjacentElement).toHaveBeenCalledTimes(1);
    expect(unmount).toHaveBeenCalledTimes(1);

    expect(answerA || answerB || answerC).toBe(false);
  });
});
