import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { act as reactDomAct } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
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
      <div data-testid="mock-tree" {...props}>{children}</div>
    ,
    TreeItem: ({ children, ...props }: any) =>
      <div data-testid="mock-tree-item" {...props}>{children}</div>
    ,
    TreeItemContent: ({ children, ...props }: any) =>
      <div data-testid="mock-tree-item-content" {...props}>{children}</div>
    ,
  };
});

const book = formatBookData(archiveBook, mockCmsBook);

describe('TableOfContents', () => {
  let store: Store;
  let Component: React.JSX.Element; // tslint:disable-line:variable-name
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
    }
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

  it('resets toc on navigate', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const component = renderer.create(Component);

    renderer.act(() => {
      component.root.findAllByType('a')[0].props.onClick({ preventDefault: () => null });
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
