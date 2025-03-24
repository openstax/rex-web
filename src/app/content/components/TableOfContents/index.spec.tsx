import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';

import { unmountComponentAtNode } from 'react-dom';
import { act as reactDomAct } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import ConnectedTableOfContents, { TableOfContents } from '.';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page, shortPage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../../test/reactutils';
import TestContainer from '../../../../test/TestContainer';
import * as reactUtils from '../../../reactUtils';
import { AppState, Store } from '../../../types';
import { assertWindow } from '../../../utils';
import * as actions from '../../actions';
import { initialState } from '../../reducer';
import { formatBookData } from '../../utils';
import * as domUtils from '../../utils/domUtils';

const book = formatBookData(archiveBook, mockCmsBook);

describe('TableOfContents', () => {
  let store: Store;
  let Component: React.JSX.Element; // tslint:disable-line:variable-name

  beforeEach(() => {
    const state = {
      content: {
        ...initialState,
        book, page,
      },
    } as any as AppState;
    store = createTestStore(state);
    Component =
      <TestContainer store={store}>
        <ConnectedTableOfContents />
      </TestContainer>;
  });

  it('mounts and unmounts without a dom', () => {
    const component = renderer.create(Component);
    expect(() => component.unmount()).not.toThrow();
  });

  it('mounts and unmmounts with a dom', () => {
    const { root } = renderToDom(Component);
    expect(() => unmountComponentAtNode(root)).not.toThrow();
  });

  it('expands and scrolls to current chapter', () => {
    const scrollSidebarSectionIntoView = jest.spyOn(domUtils, 'scrollSidebarSectionIntoView');
    const expandCurrentChapter = jest.spyOn(domUtils, 'expandCurrentChapter');

    renderer.create(Component);

    expect(expandCurrentChapter).not.toHaveBeenCalled();
    expect(scrollSidebarSectionIntoView).toHaveBeenCalledTimes(1);

    renderer.act(() => {
      store.dispatch(actions.receivePage({ ...shortPage, references: [] }));
    });

    expect(expandCurrentChapter).toHaveBeenCalled();
    expect(scrollSidebarSectionIntoView).toHaveBeenCalledTimes(2);
  });

  it('opens and closes', () => {
    jest.spyOn(reactUtils, 'useMatchMobileQuery')
      .mockReturnValue(true);
    jest.spyOn(reactUtils, 'useMatchMobileMediumQuery')
      .mockReturnValue(true);
    const component = renderer.create(Component);

    expect(component.root.findByType(TableOfContents).props.isOpen).toBe(null);
    renderer.act(() => {
      store.dispatch(actions.closeToc());
    });

    expect(component.root.findByType(TableOfContents).props.isOpen).toBe(false);

    renderer.act(() => {
      store.dispatch(actions.openToc());
    });
    expect(component.root.findByType(TableOfContents).props.isOpen).toBe(true);
  });

  it('focuses when opening', () => {
    jest.spyOn(reactUtils, 'useMatchMobileMediumQuery')
      .mockReturnValue(true);

    const { root } = renderToDom(<TestContainer store={store}>
      <ConnectedTableOfContents />
    </TestContainer>);
    const sb = root.querySelector('[data-testid="toc"]')!;
    const firstTocItem = sb.querySelector('ol > li a') as HTMLElement;
    const focusSpy = jest.spyOn(firstTocItem as any, 'focus');

    reactDomAct(() => {
      store.dispatch(actions.closeToc());
    });
    reactDomAct(() => {
      sb?.dispatchEvent(new Event('transitionend'));
    });

    expect(focusSpy).not.toHaveBeenCalled();

    reactDomAct(() => {
      store.dispatch(actions.openToc());
    });
    reactDomAct(() => {
      sb?.dispatchEvent(new Event('transitionend'));
    });

    expect(focusSpy).toHaveBeenCalled();
  });

  it('resets toc on navigate', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const component = renderer.create(Component);

    renderer.act(() => {
      component.root.findAllByType('a')[0].props.onClick({ preventDefault: () => null });
      component.root.findAllByType('a')[1].props.onClick({ preventDefault: () => null });
    });
    expect(dispatchSpy).toHaveBeenCalledWith(actions.resetToc());
  });

  it.each`
    anchorNumber | description        | isDispatchCalled
    ${2}         | ${'(TocNode)'}     | ${false}
    ${18}        | ${'(ContentLink)'} | ${true}
  `('toggles open state on Enter and Space key press $description', ({ anchorNumber, isDispatchCalled }) => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const { root } = renderToDom(Component);

    const anchor = root.querySelectorAll('a[role="treeitem"]')[anchorNumber] as HTMLAnchorElement;

    // Trigger on Enter
    ReactTestUtils.Simulate.keyDown(anchor, { key: 'Enter' });

    // Trigger on Enter
    ReactTestUtils.Simulate.keyDown(anchor, { key: ' ' });

    /*
      Trigger search and focus
      Test with different values for coverage
    */
    ReactTestUtils.Simulate.keyDown(anchor, { key: 'T' });
    ReactTestUtils.Simulate.keyDown(anchor, { key: 'p' });
    ReactTestUtils.Simulate.keyDown(anchor, { key: 'a' });

    if (isDispatchCalled) {
      expect(dispatchSpy).toHaveBeenCalled();
    } else {
      expect(dispatchSpy).not.toHaveBeenCalled();
    }

  });

  it.each`
    anchorNumber | description
    ${0}         | ${'(ContentLink)'}
    ${2}         | ${'(TocNode)'}
  `('open and closing using Arrow keys %description', ({ anchorNumber }) => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const { root } = renderToDom(Component);

    const anchor = root.querySelectorAll('a[role="treeitem"]')[anchorNumber] as HTMLAnchorElement;

    // For ContentLink does nothing
    ReactTestUtils.Simulate.keyDown(anchor, { key: 'ArrowRight' });

    ReactTestUtils.Simulate.keyDown(anchor, { key: 'ArrowLeft' });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it.each`
    anchorNumber | description
    ${0}         | ${'(ContentLink)'}
    ${2}         | ${'(TocNode)'}
  `('move using Arrow keys %description', ({ anchorNumber }) => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const { root } = renderToDom(Component);

    const anchor = root.querySelectorAll('a[role="treeitem"]')[anchorNumber] as HTMLAnchorElement;

    // Move using left when group is closed
    ReactTestUtils.Simulate.keyDown(anchor, { key: 'ArrowLeft' });

    // Open group and then move using right (ContentLink does nothing)
    ReactTestUtils.Simulate.keyDown(anchor, { key: 'ArrowRight' });
    ReactTestUtils.Simulate.keyDown(anchor, { key: 'ArrowRight' });

    // Move using up and down
    ReactTestUtils.Simulate.keyDown(anchor, { key: 'ArrowDown' });
    ReactTestUtils.Simulate.keyDown(anchor, { key: 'ArrowUp' });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it.each`
    anchorNumber | description
    ${0}         | ${'(ContentLink)'}
    ${2}         | ${'(TocNode)'}
  `('move focus to start and end of treeitems %description', ({ anchorNumber }) => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const { root } = renderToDom(Component);

    const anchor = root.querySelectorAll('a[role="treeitem"]')[anchorNumber] as HTMLAnchorElement;

    // Move focus to first treeitem
    ReactTestUtils.Simulate.keyDown(anchor, { key: 'Home' });

    // Move focus to last treeitem
    ReactTestUtils.Simulate.keyDown(anchor, { key: 'End' });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it.each`
    anchorNumber | description        | shiftKey
    ${0}         | ${'(ContentLink)'} | ${true}
    ${0}         | ${'(ContentLink)'} | ${false}
    ${2}         | ${'(TocNode)'}     | ${true}
    ${2}         | ${'(TocNode)'}     | ${false}
    ${18}         | ${'(TocNode)'}     | ${false}
  `('trigger tab navigation %description', ({ anchorNumber, shiftKey }) => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const { root } = renderToDom(Component);
    const anchor = root.querySelectorAll('a[role="treeitem"]')[anchorNumber] as HTMLAnchorElement;

    // Move focus to the first treeitem if shiftKey is false and to the last treeitem if is true
    ReactTestUtils.Simulate.keyDown(anchor, { key: 'Tab', shiftKey });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('resizes on scroll', () => {
    if (!document || !window) {
      expect(window).toBeTruthy();
      return expect(document).toBeTruthy();
    }

    const { node } = renderToDom(Component);
    const spy = jest.spyOn(node.style, 'setProperty');

    const event = document.createEvent('UIEvents');
    event.initEvent('scroll', true, false);
    reactDomAct(() => {
      assertWindow().dispatchEvent(event);
    });

    expect(spy).toHaveBeenCalledWith('height', expect.anything());
  });
});
