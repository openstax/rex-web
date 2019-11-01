import { HTMLElement } from '@openstax/types/lib.dom';
import { page } from '../../../../test/mocks/archiveLoader';
import { scrollTo } from '../../../domUtils';
import { assertWindow } from '../../../utils';
import scrollTargetManager from './scrollTargetManager';

// https://github.com/facebook/jest/issues/936#issuecomment-463644784
jest.mock('../../../domUtils', () => ({
  // remove cast to any when the jest type is updated to include requireActual()
  ...(jest as any).requireActual('../../../domUtils'),
  scrollTo: jest.fn(),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

describe('scrollTargetManager', () => {
  let window: Window;
  let element: HTMLElement;
  let manager: ReturnType<typeof scrollTargetManager>;

  beforeEach(() => {
    window = assertWindow();
    element = window.document.createElement('div');
    manager = scrollTargetManager(element);
  });

  it('scrolls to hash when it changes', async() => {

    const target = window.document.createElement('div');
    target.setAttribute('id', 'qwer');

    element.append(target);

    manager({hash: '#asdf', page}, {hash: '#qwer', page});

    await Promise.resolve();

    expect(scrollTo).toHaveBeenCalledWith(target);
  });

  it('doesn\'t scroll to anything if hash changes to something that doesn\'t exist', async() => {

    const target = window.document.createElement('div');
    target.setAttribute('id', 'wolololo');

    element.append(target);

    manager({hash: '#asdf', page}, {hash: '#qwer', page});

    await Promise.resolve();

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
