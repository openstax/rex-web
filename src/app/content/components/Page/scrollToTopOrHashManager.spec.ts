import { HTMLElement } from '@openstax/types/lib.dom';
import defer from 'lodash/fp/defer';
import { page } from '../../../../test/mocks/archiveLoader';
import { scrollTo } from '../../../domUtils';
import { assertWindow } from '../../../utils';
import { SearchScrollTarget, SelectedResult } from '../../search/types';
import scrollToTopOrHashManager from './scrollToTopOrHashManager';

// https://github.com/facebook/jest/issues/936#issuecomment-463644784
jest.mock('../../../domUtils', () => ({
  // remove cast to any when the jest type is updated to include requireActual()
  ...(jest as any).requireActual('../../../domUtils'),
  scrollTo: jest.fn(),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

describe('scrollToTopOrHashManager', () => {
  let window: Window;
  let element: HTMLElement;
  let manager: ReturnType<typeof scrollToTopOrHashManager>;

  beforeEach(() => {
    window = assertWindow();
    element = window.document.createElement('div');
    manager = scrollToTopOrHashManager(element);
  });

  it('scrolls to hash when it changes', async() => {

    const target = window.document.createElement('div');
    target.setAttribute('id', 'qwer');

    element.append(target);

    manager(
      {hash: '#asdf', page, scrollTarget: null, selectedResult: null},
      {hash: '#qwer', page, scrollTarget: null, selectedResult: null});

    await new Promise(defer);

    expect(scrollTo).toHaveBeenCalledWith(target);
  });

  it('doesn\'t scroll to anything if hash changes to something that doesn\'t exist', async() => {

    const target = window.document.createElement('div');
    target.setAttribute('id', 'wolololo');

    element.append(target);

    manager(
      {hash: '#asdf', page, scrollTarget: null, selectedResult: null},
      {hash: '#qwer', page, scrollTarget: null, selectedResult: null});

    await Promise.resolve();

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('noops if there is a scroll target that is matching current selected result', async() => {
    const target = window.document.createElement('div');
    target.setAttribute('id', 'qwer');

    element.append(target);

    const scrollTarget: SearchScrollTarget = {
      elementId: 'search-results-el',
      index: 0,
      type: 'search',
    };
    const selectedResult = {
      highlight: scrollTarget.index,
      result: {
        source: {
          elementId: scrollTarget.elementId,
        },
      },
    } as any as SelectedResult;

    manager(
      {hash: '#asdf', page, scrollTarget: null, selectedResult: null},
      {hash: '#qwer', page, scrollTarget, selectedResult});

    await Promise.resolve();

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
