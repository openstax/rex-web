import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { act as reactDomAct } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import { HTMLElement } from '@openstax/types/lib.dom';
import ConnectedTableOfContents, { TableOfContents } from '.';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page, shortPage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../../test/reactutils';
import TestContainer from '../../../../test/TestContainer';
import * as reactUtils from '../../../reactUtils';
import * as mediaUtils from '../../../reactUtils/mediaQueryUtils';
import { AppState, Store } from '../../../types';
import { assertWindow } from '../../../utils';
import * as actions from '../../actions';
import { Page } from '../../types';
import { initialState } from '../../reducer';
import { formatBookData } from '../../utils';
import * as domUtils from '../../utils/domUtils';

jest.mock('react-aria-components', () => {
  const actual = jest.requireActual('react-aria-components');
  return {
    ...actual,
    Tree: ({ children, ...props }: any) =>
      <div data-testid='mock-tree' role='treegrid' {...props}>{children}</div>
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

  afterEach(() => {
    jest.restoreAllMocks();
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
    jest.spyOn(mediaUtils, 'useMatchMobileQuery')
      .mockReturnValue(true);
    jest.spyOn(mediaUtils, 'useMatchMobileMediumQuery')
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
    jest.spyOn(mediaUtils, 'useMatchMobileMediumQuery')
      .mockReturnValue(true);

    const { root } = renderToDom(<TestContainer store={store}>
      <ConnectedTableOfContents />
    </TestContainer>);
    const sb = root.querySelector('[data-testid="toc"]')!;
    const firstTocItem = sb.querySelector('[role="treegrid"] div') as HTMLElement;
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
    jest.spyOn(mediaUtils, 'useMatchMobileMediumQuery')
      .mockReturnValue(true);

    // Create a mock button element to restore focus to
    const mockButton = document!.createElement('button');
    mockButton.setAttribute('data-testid', 'toc-button');
    document?.body.appendChild(mockButton);
    const mockButtonFocusSpy = jest.spyOn(mockButton, 'focus');

    const { root } = renderToDom(<TestContainer store={store}>
      <ConnectedTableOfContents />
    </TestContainer>);
    const sb = root.querySelector('[data-testid="toc"]') as HTMLElement;

    expect(sb).toBeDefined();

    // Get the first TOC item and make it focusable, with a spy to update activeElement
    const firstTocItem = sb.querySelector('[role="treegrid"] div') as HTMLElement;
    const originalFocus = firstTocItem.focus.bind(firstTocItem);
    const firstTocItemFocusSpy = jest.spyOn(firstTocItem as any, 'focus').mockImplementation(() => {
      // Simulate actual focus behavior by updating the element's focus state
      originalFocus();
    });

    // Focus the mock button, then open the TOC
    reactDomAct(() => {
      mockButton.focus();
      store.dispatch(actions.openToc());
    });
    reactDomAct(() => {
      sb.dispatchEvent(new Event('transitionend'));
    });

    // Focus should have moved away from the button to first item
    expect(firstTocItemFocusSpy).toHaveBeenCalled();

    // Close the TOC
    reactDomAct(() => {
      store.dispatch(actions.closeToc());
    });
    reactDomAct(() => {
      sb.dispatchEvent(new Event('transitionend'));
    });

    // Focus should have been restored to the TOC button
    expect(mockButtonFocusSpy).toHaveBeenCalled();

    // Cleanup
    document?.body.removeChild(mockButton);
  });

  it('focuses close button on Shift+Tab in tree', () => {
    jest.spyOn(mediaUtils, 'useMatchMobileMediumQuery')
      .mockReturnValue(true);

    // Create a mock close button element first
    const mockCloseButton = document!.createElement('button');
    mockCloseButton.setAttribute('data-testid', 'toc-button');
    const mockCloseButtonFocusSpy = jest.spyOn(mockCloseButton, 'focus');

    // Render the component using renderer.create so we can access the instance
    const component = renderer.create(<TestContainer store={store}>
      <ConnectedTableOfContents />
    </TestContainer>);

    // Open the TOC
    renderer.act(() => {
      store.dispatch(actions.openToc());
    });

    // Get the TableOfContents component instance
    const tocComponent = component.root.findByType(TableOfContents);
    const tocInstance = tocComponent.instance as TableOfContents;

    // Manually set up the mock button in the sidebar ref
    // We need to create a mock sidebar structure
    const mockSidebar = {
      querySelector: jest.fn().mockReturnValue(mockCloseButton),
    } as any;
    tocInstance.sidebar = { current: mockSidebar };

    // Create a mock keyboard event
    const mockEvent = {
      key: 'Tab',
      shiftKey: true,
      preventDefault: jest.fn(),
    } as any as React.KeyboardEvent;

    renderer.act(() => {
      // Call the handleTreeKeyUp method directly
      tocInstance.handleTreeKeyUp(mockEvent);
    });

    // Expect the close button to have been focused
    expect(mockCloseButtonFocusSpy).toHaveBeenCalled();
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('does not focus close button when key is not Shift+Tab', () => {
    jest.spyOn(mediaUtils, 'useMatchMobileMediumQuery')
      .mockReturnValue(true);

    const mockCloseButton = document!.createElement('button');
    mockCloseButton.setAttribute('data-testid', 'toc-button');
    const mockCloseButtonFocusSpy = jest.spyOn(mockCloseButton, 'focus');

    const component = renderer.create(<TestContainer store={store}>
      <ConnectedTableOfContents />
    </TestContainer>);

    renderer.act(() => {
      store.dispatch(actions.openToc());
    });

    const tocComponent = component.root.findByType(TableOfContents);
    const tocInstance = tocComponent.instance as TableOfContents;

    const mockSidebar = {
      querySelector: jest.fn().mockReturnValue(mockCloseButton),
    } as any;
    tocInstance.sidebar = { current: mockSidebar };

    // Test with Tab but no Shift
    const mockEventTabOnly = {
      key: 'Tab',
      shiftKey: false,
      preventDefault: jest.fn(),
    } as any as React.KeyboardEvent;

    renderer.act(() => {
      tocInstance.handleTreeKeyUp(mockEventTabOnly);
    });

    // Should NOT have focused the button or prevented default
    expect(mockCloseButtonFocusSpy).not.toHaveBeenCalled();
    expect(mockEventTabOnly.preventDefault).not.toHaveBeenCalled();
  });

  it('does not focus close button when close button is not found', () => {
    jest.spyOn(mediaUtils, 'useMatchMobileMediumQuery')
      .mockReturnValue(true);

    const component = renderer.create(<TestContainer store={store}>
      <ConnectedTableOfContents />
    </TestContainer>);

    renderer.act(() => {
      store.dispatch(actions.openToc());
    });

    const tocComponent = component.root.findByType(TableOfContents);
    const tocInstance = tocComponent.instance as TableOfContents;

    // Mock sidebar querySelector to return null (button not found)
    const mockSidebar = {
      querySelector: jest.fn().mockReturnValue(null),
    } as any;
    tocInstance.sidebar = { current: mockSidebar };

    const mockEvent = {
      key: 'Tab',
      shiftKey: true,
      preventDefault: jest.fn(),
    } as any as React.KeyboardEvent;

    renderer.act(() => {
      tocInstance.handleTreeKeyUp(mockEvent);
    });

    // Should NOT have prevented default since button wasn't found
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
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

  it('adds event listener when ToC is open on mobile', () => {
    jest.spyOn(mediaUtils, 'useMatchMobileQuery')
      .mockReturnValue(true);
    jest.spyOn(mediaUtils, 'useMatchMobileMediumQuery')
      .mockReturnValue(false);

    const addEventListenerSpy = jest.spyOn(document!, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document!, 'removeEventListener');

    const { unmount } = renderToDom(<TestContainer store={store}>
      <ConnectedTableOfContents />
    </TestContainer>);

    reactDomAct(() => {
      store.dispatch(actions.openToc());
    });

    // Find the actual keydown handler that was registered
    const keydownCall = addEventListenerSpy.mock.calls.find(
      ([eventType]) => eventType === 'keydown'
    );

    expect(keydownCall).toBeDefined();

    const [, keydownHandler, useCapture] = keydownCall!;

    // Verify addEventListener was called with 'keydown' event for tab trapping
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', keydownHandler, useCapture);
    expect(useCapture).toBe(true);

    // Cleanup: specifically verify that unmount removes the same event listener
    removeEventListenerSpy.mockClear();
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', keydownHandler, useCapture);
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

  it('adds aria-label to TreeItem for leaf sections (links)', () => {
    const component = renderer.create(Component);

    // Find mock-tree-item elements that represent leaf nodes (links to pages)
    const treeItems = component.root.findAll((node: any) =>
      node.props && node.props['data-testid'] === 'mock-tree-item' && node.props['aria-label']
    );

    // Find a specific leaf item - look for one that ends with ', link'
    const leafItem = treeItems.find((item: any) =>
      item.props['aria-label'] && item.props['aria-label'].endsWith(', link')
    );

    // Verify a leaf TreeItem exists
    expect(leafItem).toBeDefined();
    if (!leafItem) {
      throw new Error('Expected to find a TreeItem with aria-label ending in ", link"');
    }

    // Verify the aria-label matches the expected format
    // The aria-label should be built from a title (which has been stripped of HTML) plus ", link"
    expect(leafItem.props['aria-label']).toMatch(/^.+, link$/);

    // Verify the aria-label contains actual content (not just the suffix)
    expect(leafItem.props['aria-label'].length).toBeGreaterThan(', link'.length);

    // Verify the textValue prop (used for keyboard navigation) is also set correctly
    expect(leafItem.props['textValue']).toBeDefined();
    expect(typeof leafItem.props['textValue']).toBe('string');
  });

  it('adds aria-label to TreeItem for expandable sections', () => {
    const component = renderer.create(Component);

    // Find mock-tree-item elements
    const treeItems = component.root.findAll((node: any) =>
      node.props && node.props['data-testid'] === 'mock-tree-item' && node.props['aria-label']
    );

    // Find a specific section item - look for one that ends with ', section'
    const sectionItem = treeItems.find((item: any) =>
      item.props['aria-label'] && item.props['aria-label'].endsWith(', section')
    );

    // Verify a section TreeItem exists
    expect(sectionItem).toBeDefined();
    if (!sectionItem) {
      throw new Error('Expected to find a TreeItem with aria-label ending in ", section"');
    }

    // Verify the aria-label matches the expected format
    // The aria-label should be built from a section title (stripped of HTML) plus ", section"
    expect(sectionItem.props['aria-label']).toMatch(/^.+, section$/);

    // Verify the aria-label contains actual content (not just the suffix)
    expect(sectionItem.props['aria-label'].length).toBeGreaterThan(', section'.length);

    // Verify the textValue prop (used for keyboard navigation) is also set correctly
    expect(sectionItem.props['textValue']).toBeDefined();
    expect(typeof sectionItem.props['textValue']).toBe('string');
  });
});

describe('expandParentsOfCurrentPage', () => {
  const pageUuid = '12345678-abcd-1234-abcd-1234567890ab';
  // Use a simpler book structure that matches the actual book's tree
  // but reuse properties from the formatted book to avoid routing errors
  const mockBook = {
    ...book,
    tree: {
      id: 'root',
      title: 'Root',
      contents: [
        {
          id: 'chapter1',
          title: 'Chapter 1',
          contents: [
            {
              id: pageUuid,
              title: 'Page 1',
            },
          ],
        },
      ],
    },
  } as any;

  const mockPage = { id: pageUuid, abstract: null, title: 'Page 1', slug: 'page-1' } as Page;

  let componentDidMountSpy: jest.SpyInstance;

  afterEach(() => {
    componentDidMountSpy?.mockRestore();
  });

  it('does not setState when no parents need expansion (changed=false)', () => {
    componentDidMountSpy = jest.spyOn(TableOfContents.prototype, 'componentDidMount').mockImplementation(jest.fn());

    const component = renderer.create(
      <TestContainer store={createTestStore({} as any)}>
        <TableOfContents
          isOpen={true}
          book={mockBook}
          page={mockPage}
          onNavigate={jest.fn()}
        />
      </TestContainer>
    );

    const instance = component.root.findByType(TableOfContents).instance as TableOfContents;
    
    // Set all parents as already expanded so changed will be false
    renderer.act(() => {
      instance.setState({ expandedKeys: new Set(['root', 'chapter1']) });
    });

    const setStateSpy = jest.spyOn(instance, 'setState');
    setStateSpy.mockClear();

    renderer.act(() => {
      instance['expandParentsOfCurrentPage']();
    });

    expect(setStateSpy).not.toHaveBeenCalled();

    setStateSpy.mockRestore();
  });

  it('does setState when parents need expansion (changed=true)', () => {
    componentDidMountSpy = jest.spyOn(TableOfContents.prototype, 'componentDidMount').mockImplementation(jest.fn());

    const component = renderer.create(
      <TestContainer store={createTestStore({} as any)}>
        <TableOfContents
          isOpen={true}
          book={mockBook}
          page={mockPage}
          onNavigate={jest.fn()}
        />
      </TestContainer>
    );

    const instance = component.root.findByType(TableOfContents).instance as TableOfContents;

    renderer.act(() => {
      instance.setState({ expandedKeys: new Set() });
    });

    const setStateSpy = jest.spyOn(instance, 'setState');
    setStateSpy.mockClear();

    renderer.act(() => {
      instance['expandParentsOfCurrentPage']();
    });

    expect(setStateSpy).toHaveBeenCalled();
    const callArgs = setStateSpy.mock.calls[0][0] as any;
    expect(callArgs.expandedKeys).toBeInstanceOf(Set);
    expect(callArgs.expandedKeys.has('chapter1')).toBe(true);

    setStateSpy.mockRestore();
  });

  it('returns early when currentNode is not found in tree', () => {
    componentDidMountSpy = jest.spyOn(TableOfContents.prototype, 'componentDidMount').mockImplementation(jest.fn());

    const component = renderer.create(
      <TestContainer store={createTestStore({} as any)}>
        <TableOfContents
          isOpen={true}
          book={mockBook}
          page={{ id: 'nonexistent-page', abstract: null, title: 'Not Found', slug: 'not-found' } as Page}
          onNavigate={jest.fn()}
        />
      </TestContainer>
    );

    const instance = component.root.findByType(TableOfContents).instance as TableOfContents;

    const setStateSpy = jest.spyOn(instance, 'setState');
    setStateSpy.mockClear();

    renderer.act(() => {
      instance['expandParentsOfCurrentPage']();
    });

    // Should not call setState when currentNode is not found
    expect(setStateSpy).not.toHaveBeenCalled();

    setStateSpy.mockRestore();
  });
});
