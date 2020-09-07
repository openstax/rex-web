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

const createScrollTarget = (container: HTMLElement, id: string) => {
  const target = assertWindow().document.createElement('div');
  target.setAttribute('id', id);

  container.append(target);

  return target;
};

describe('scrollTargetManager', () => {
  let window: Window;
  let windowScrollSpy: jest.SpyInstance;
  let element: HTMLElement;
  let manager: ReturnType<typeof scrollTargetManager>;

  beforeEach(() => {
    window = assertWindow();
    element = window.document.createElement('div');
    manager = scrollTargetManager(element);

    windowScrollSpy = jest.spyOn(window, 'scrollTo');
  });

  it('scrolls gradually', async() => {
    const container = createScrollTarget(element, 'container');
    const target = createScrollTarget(container, 'inner');

    manager({page, hash: '#container', htmlNode: target});

    expect(windowScrollSpy).toHaveBeenCalled();

    // wait for images
    await Promise.resolve();
    // wait for first scrollToTarget
    await Promise.resolve();

    expect(scrollTo).toHaveBeenCalledWith(container);
    expect(scrollTo).not.toHaveBeenCalledWith(target);

    // wait for images again
    await Promise.resolve();
    // wait for second scrollToTarget
    await Promise.resolve();

    expect(scrollTo).toHaveBeenCalledWith(target);
  });

  it('doesn\'t scroll to elements that don\'t exist', async() => {
    createScrollTarget(element, 'wolololo');

    manager({page, hash: '#asdf', htmlNode: undefined});

    await Promise.resolve();
    await Promise.resolve();

    expect(windowScrollSpy).toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('doesn\'t scroll to hash if it is empty string', async() => {
    createScrollTarget(element, 'wolololo');

    manager({page, hash: '', htmlNode: undefined});

    await Promise.resolve();
    await Promise.resolve();

    expect(windowScrollSpy).toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('scrolls only if things change', async() => {
    const targetA = createScrollTarget(element, 'targetA');
    const targetB = createScrollTarget(element, 'targetB');

    manager({page, hash: '#targetA', htmlNode: undefined});
    expect(windowScrollSpy).toHaveBeenCalled();

    await Promise.resolve();
    await Promise.resolve();

    expect(scrollTo).toHaveBeenCalledWith(targetA);
    windowScrollSpy.mockClear();

    manager({page, hash: '#targetB', htmlNode: undefined});
    expect(windowScrollSpy).not.toHaveBeenCalled();

    await Promise.resolve();
    await Promise.resolve();

    expect(scrollTo).toHaveBeenCalledWith(targetB);
    expect(scrollTo).toHaveBeenCalledTimes(2);

    manager({page, hash: '#targetB', htmlNode: undefined});
    expect(windowScrollSpy).not.toHaveBeenCalled();

    await Promise.resolve();
    await Promise.resolve();

    expect(scrollTo).toHaveBeenCalledTimes(2);
  });
});
