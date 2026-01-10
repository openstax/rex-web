import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { act as reactDomAct } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import { HTMLElement } from '@openstax/types/lib.dom';
import ConnectedTableOfContents, { TableOfContents, maybeAriaLabel } from '.';
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

jest.mock('react-aria-components', () => {
  const actual = jest.requireActual('react-aria-components');
  return {
    ...actual,
    Tree: ({ children, ...props }: any) =>
      <div data-testid='mock-tree' {...props}>{children}</div>
    ,
    TreeItem: ({ children, ...props }: any) =>
      <div data-testid='mock-tree-item' {...props}>{children}</div>
    ,
    TreeItemContent: ({ children, ...props }: any) =>
      <div data-testid='mock-tree-item-content' {...props}>{children}</div>
    ,
  };
});

const book = formatBookData(archiveBook, mockCmsBook);

describe('TableOfContents', () => {
  let store: Store;
  let Component: React.JSX.Element;
  let SecondComponent: React.JSX.Element;

  const mockBook = {
    tree: {
      id: 'root',
      title: 'Root Section',
      children: [],
      contents: [
        {
          id: 'item-1',
          title: 'Item 1',
          contents: [],
          parent: { title: 'Chapter 1' },
        },
      ],
    },
  } as any;

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
    SecondComponent =
      <TestContainer store={store}>
        <TableOfContents
          isOpen={true}
          book={mockBook}
          page={undefined}
          onNavigate={jest.fn()}
        />
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
    const firstTocItem = sb.querySelector('div > div a, div > div div span') as HTMLElement;
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

  it('restores focus to TOC button when closing', () => {
    jest.spyOn(reactUtils, 'useMatchMobileMediumQuery')
      .mockReturnValue(true);

    // Create a mock button element to restore focus to
    const mockButton = document.createElement('button');
    mockButton.setAttribute('data-testid', 'toc-button');
    document.body.appendChild(mockButton);
    const mockButtonFocusSpy = jest.spyOn(mockButton, 'focus');

    const { root } = renderToDom(<TestContainer store={store}>
      <ConnectedTableOfContents />
    </TestContainer>);
    const sb = root.querySelector('[data-testid="toc"]')!;

    // Focus the mock button, then open the TOC
    reactDomAct(() => {
      mockButton.focus();
      store.dispatch(actions.openToc());
    });
    reactDomAct(() => {
      sb?.dispatchEvent(new Event('transitionend'));
    });

    // Focus should have moved away from the button to first item
    expect(document?.activeElement).not.toBe(mockButton);

    // Close the TOC
    reactDomAct(() => {
      store.dispatch(actions.closeToc());
    });
    reactDomAct(() => {
      sb?.dispatchEvent(new Event('transitionend'));
    });

    // Focus should have been restored to the TOC button
    expect(mockButtonFocusSpy).toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(mockButton);
  });

  it('does not focus first item when TOC is closed', () => {
    jest.spyOn(reactUtils, 'useMatchMobileMediumQuery')
      .mockReturnValue(true);

    const { root } = renderToDom(<TestContainer store={store}>
      <ConnectedTableOfContents />
    </TestContainer>);
    const sb = root.querySelector('[data-testid="toc"]')!;
    const firstTocItem = sb.querySelector('div > div a, div > div div span') as HTMLElement;
    const focusSpy = jest.spyOn(firstTocItem as any, 'focus');

    // Keep TOC closed and dispatch transitionend
    reactDomAct(() => {
      store.dispatch(actions.closeToc());
    });
    reactDomAct(() => {
      sb?.dispatchEvent(new Event('transitionend'));
    });

    // Focus should NOT have been called because TOC is closed
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('does not try to restore focus when TOC opens (not closes)', () => {
    jest.spyOn(reactUtils, 'useMatchMobileMediumQuery')
      .mockReturnValue(true);

    // Create a mock button element to restore focus to
    const mockButton = document.createElement('button');
    mockButton.setAttribute('data-testid', 'toc-button');
    document.body.appendChild(mockButton);
    const mockButtonFocusSpy = jest.spyOn(mockButton, 'focus');

    const { root } = renderToDom(<TestContainer store={store}>
      <ConnectedTableOfContents />
    </TestContainer>);
    const sb = root.querySelector('[data-testid="toc"]')!;

    // Open the TOC
    reactDomAct(() => {
      store.dispatch(actions.openToc());
    });
    reactDomAct(() => {
      sb?.dispatchEvent(new Event('transitionend'));
    });

    // Focus should NOT be restored to the button because TOC is opening, not closing
    expect(mockButtonFocusSpy).not.toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(mockButton);
  });

  it('resets toc on navigate', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const component = renderer.create(Component);

    renderer.act(() => {
      component.root.findAllByType('a')[0].props.onClick({ preventDefault: () => null, stopPropagation: () => null });
    });
    expect(dispatchSpy).toHaveBeenCalledWith(actions.resetToc());
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

  it('updates expandedKeys with handleExpandedChange', () => {

    const component = renderer.create(SecondComponent);

    const instance = component.root.findByType(TableOfContents).instance as TableOfContents;

    renderer.act(() => {
      instance.handleExpandedChange(new Set(['abc', 'xyz']));
    });

    expect(instance.state.expandedKeys).toEqual(new Set(['abc', 'xyz']));
  });

  it('removes item from expandedKeys via handleTreeItemClick', () => {
    const component = renderer.create(SecondComponent);

    const instance = component.root.findByType(TableOfContents).instance as TableOfContents;

    renderer.act(() => {
      instance.setState({ expandedKeys: new Set(['item-1']) });
    });

    const treeItem = component.root.findAllByProps({ 'data-testid': 'mock-tree-item' })[0];

    renderer.act(() => {
      treeItem.props.onClick();
    });

    expect(instance.state.expandedKeys).toEqual(new Set());
  });

  it('returns null in SSR', () => {
    jest.spyOn(reactUtils, 'isSSR').mockReturnValue(true);
    const component = renderer.create(Component);
    expect(component.toJSON()).toBeNull();
    component.unmount();
  });

  it('renders TOC heading as h2 for accessibility', () => {
    renderToDom(Component);
    const domRoot = document?.body!;

    // First verify the TOC sidebar is rendered
    const tocSidebar = domRoot.querySelector('[data-testid="toc"]');
    expect(tocSidebar).not.toBeNull();

    // Query for the h2 element within the document body (renderToDom appends to body)
    const h2Element = domRoot.querySelector('h2');

    // Verify that an h2 element exists
    expect(h2Element).not.toBeNull();

    // Verify it contains the "Table of contents" text
    expect(h2Element?.textContent).toBe('Table of contents');
  });
});

describe('maybeAriaLabel', () => {
  const mockPage = {
    id: 'some-id',
    title: '<span class="os-number">1</span><span class="os-divider"> </span><span class="os-text">chapter 1</span>',
    parent: {
      title: 'Chapter 1',
    },
  } as any;

  it('returns aria-label when active is true', () => {
    const result = maybeAriaLabel(mockPage, true);
    expect(result).toEqual({ 'aria-label': 'Current Page' });
  });

  it('returns empty object when active is false', () => {
    const result = maybeAriaLabel(mockPage, false);
    expect(result).toEqual({});
  });
});
