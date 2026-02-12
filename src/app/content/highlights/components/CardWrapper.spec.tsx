import { Highlight } from '@openstax/highlighter';
import { Document, HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import createMockHighlight from '../../../../test/mocks/highlight';
import OnEsc from '../../../components/OnEsc';
import { dispatchKeyDownEvent } from '../../../../test/reactutils';
import { runHooks } from '../../../../test/utils';
import { Store } from '../../../types';
import { assertDocument, remsToPx } from '../../../utils';
import { assertWindow } from '../../../utils/browser-assertions';
import { focusHighlight, clearFocusedHighlight } from '../actions';
import { cardMarginBottom, highlightKeyCombination } from '../constants';
import Card, { CardProps } from './Card';
import * as cardUtils from './cardUtils';
import CardWrapper from './CardWrapper';

const dispatchFocusOutEvent = (
  window: Window,
  element: Document | HTMLElement,
  relatedTarget: HTMLElement
) => {
  const focusEvent = window.document.createEvent('FocusEvent');
  focusEvent.initEvent('focusout', true, true);
  Object.defineProperty(focusEvent, 'relatedTarget', { value: relatedTarget });
  element.dispatchEvent(focusEvent);
};

const dispatchHighlightToggle = (target: HTMLElement | undefined) => {
  dispatchKeyDownEvent({ code: highlightKeyCombination.code, altKey: highlightKeyCombination.altKey, target });
};

jest.mock('./Card', () => (props: any) => <span data-mock-card {...props} />);

jest.mock('./cardUtils', () => ({
  ...jest.requireActual('./cardUtils'),
  getHighlightOffset: jest.fn(() => ({ top: 100, bottom: 100 })),
}));

let usesResizeObserverPolyfill = false;
jest.mock('resize-observer-polyfill', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((callback) => {
    usesResizeObserverPolyfill = true;
    callback();
    return {
      disconnect: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    };
  }),
}));

describe('CardWrapper', () => {
  let store: Store;
  let container: HTMLElement;

  beforeEach(() => {
    store = createTestStore();
    container = assertDocument().createElement('div');
    assertDocument().body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('matches snapshot', () => {
    const component = renderer.create(<Provider store={store}>
      <CardWrapper container={container} highlights={[createMockHighlight('id1')]} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  // These get code coverage, but don't do anything testable I don't think.
  it('handles selectionchange', () => {
    renderer.create(<Provider store={store}>
      <CardWrapper container={container} highlights={[createMockHighlight('id1')]} />
    </Provider>);

    renderer.act(() => {
      document?.dispatchEvent(new Event('selectionchange'));
    });
    renderer.act(() => {
      store.dispatch(focusHighlight('id1'));
    });
    renderer.act(() => {
      document?.dispatchEvent(new Event('selectionchange'));
    });
    const gSpy = jest.spyOn(document!, 'getSelection').mockReturnValue({
      isCollapsed: false,
    } as any);
    renderer.act(() => {
      document?.dispatchEvent(new Event('selectionchange'));
    });
    gSpy.mockReset();
  });

  it('matches snapshot when there is no highlights', () => {
    const component = renderer.create(<Provider store={store}>
      <CardWrapper container={container} highlights={[]} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders cards', () => {
    const component = renderer.create(<Provider store={store}>
      <CardWrapper container={container} highlights={[createMockHighlight(), createMockHighlight()]} />
    </Provider>);

    expect(component.root.findAllByType(Card).length).toBe(2);
  });

  it('set highlight as hidden if it\'s inside a collapsed ancestor', () => {
    const element = assertDocument().createElement('p');
    const collapsedAncestor = assertDocument().createElement('details');
    collapsedAncestor.removeAttribute('open');
    collapsedAncestor.dataset.type = 'solution';
    collapsedAncestor.appendChild(element);

    const hiddenHighlight = {
      ...createMockHighlight(),
      elements: [element],
    };

    const component = renderer.create(<Provider store={store}>
      <CardWrapper container={container} highlights={[createMockHighlight(), hiddenHighlight]} />
    </Provider>);

    const [card, hiddenCard] = component.root.findAllByType(Card);
    expect((card.props as CardProps).isHidden).toBe(false);
    expect((hiddenCard.props as CardProps).isHidden).toBe(true);
  });

  it(`handles card's height changes`, () => {
    const component = renderer.create(<Provider store={store}>
      <CardWrapper container={container} highlights={[createMockHighlight(), createMockHighlight()]} />
    </Provider>);

    const [card1, card2] = component.root.findAllByType(Card);

    // Update state with a height
    renderer.act(() => {
      card1.props.onHeightChange({ current: { offsetHeight: 100 } });
      card2.props.onHeightChange({ current: { offsetHeight: 100 } });
    });
    // Cards are now centered on their highlights. With mock returning {top: 100, bottom: 100} (0 height highlight)
    // and card height of 100px, centered position is: 100 + (0/2) - (100/2) = 50
    expect(card1.props.topOffset).toEqual(50);
    expect(card2.props.topOffset).toEqual(50 + 100 + remsToPx(cardMarginBottom));

    // Noops when height is the same
    renderer.act(() => {
      card1.props.onHeightChange({ current: { offsetHeight: 100 } });
    });
    expect(card1.props.topOffset).toEqual(50);
    expect(card2.props.topOffset).toEqual(50 + 100 + remsToPx(cardMarginBottom));

    // Handle null value
    renderer.act(() => {
      card1.props.onHeightChange({ current: null });
    });
    // First card have null height (treated as 0), so centered at 100 + (0/2) - (0/2) = 100
    // Second card starts at the highlight top offset, centered: 100 + (0/2) - (100/2) = 50
    expect(card1.props.topOffset).toEqual(100);
    expect(card2.props.topOffset).toEqual(50);

    expect(() => component.root.findAllByType(Card)).not.toThrow();
  });

  it(`update only these cards that needs it when focusing highlight`, () => {
    const highlights = [createMockHighlight(), createMockHighlight(), createMockHighlight(), createMockHighlight()];
    // Simulate existing highlights by adding mock DOM elements
    // This indicates these are saved highlights, not new text selections
    highlights.forEach(h => {
      h.elements = [document?.createElement('span') as HTMLElement];
    });
    const highlightsPositionsInDocument = [0, 100, 120, 300];

    jest.spyOn(cardUtils, 'getHighlightOffset')
      .mockImplementation((_container: any, highlight: Highlight) => {
        const top = highlightsPositionsInDocument[highlights.findIndex((search) => search.id === highlight.id)];
        return {
          bottom: top,
          top,
        };
      });

    const component = renderer.create(<Provider store={store}>
      <CardWrapper container={container} highlights={highlights} />
    </Provider>);

    const [card1, card2, card3, card4] = component.root.findAllByType(Card);
    expect(card1.props.topOffset).toEqual(undefined);
    expect(card2.props.topOffset).toEqual(undefined);
    expect(card3.props.topOffset).toEqual(undefined);
    expect(card3.props.topOffset).toEqual(undefined);

    // Update state with a height
    renderer.act(() => {
      card1.props.onHeightChange({ current: { offsetHeight: 50 } });
      card2.props.onHeightChange({ current: { offsetHeight: 50 } });
      card3.props.onHeightChange({ current: { offsetHeight: 50 } });
      card4.props.onHeightChange({ current: { offsetHeight: 50 } });
    });
    // Cards are centered on their highlights (0-height highlights with 50px cards)
    expect(card1.props.topOffset).toEqual(0); // centered at 0 + 0/2 - 50/2 = -25, but max(0, -25) = 0
    expect(card2.props.topOffset).toEqual(75); // centered at 100 - 25 = 75
    // card3 centered would be 120 - 25 = 95, but card2 ends at 75+50=125
    // so stacked: 125 + margin(20) = 145
    expect(card3.props.topOffset).toEqual(145);
    expect(card4.props.topOffset).toEqual(275); // centered at 300 - 25 = 275

    // Focusing card3 should NOT reposition it (no jumping for existing highlights)
    renderer.act(() => {
      store.dispatch(focusHighlight(card3.props.highlight.id));
    });
    // All cards stay at their original positions
    expect(card1.props.topOffset).toEqual(0);
    expect(card2.props.topOffset).toEqual(75);
    expect(card3.props.topOffset).toEqual(145);
    expect(card4.props.topOffset).toEqual(275);

    // Focusing card1 should NOT reposition cards (no jumping for existing highlights)
    renderer.act(() => {
      store.dispatch(focusHighlight(card1.props.highlight.id));
    });
    // All cards stay at their positions
    expect(card1.props.topOffset).toEqual(0);
    expect(card2.props.topOffset).toEqual(75);
    expect(card3.props.topOffset).toEqual(145);
    expect(card4.props.topOffset).toEqual(275);

    // focusing card4 doesn't affect earlier cards
    renderer.act(() => {
      store.dispatch(focusHighlight(card4.props.highlight.id));
    });
    // card4 stays at its centered position, earlier cards unchanged
    expect(card1.props.topOffset).toEqual(0);
    expect(card2.props.topOffset).toEqual(75);
    expect(card3.props.topOffset).toEqual(145);
    expect(card4.props.topOffset).toEqual(275);

    expect(() => component.root.findAllByType(Card)).not.toThrow();
  });

  it('does not throw on unmount when highlight is focused', () => {
    const highlight = createMockHighlight();
    store.dispatch(focusHighlight(highlight.id));

    const component = renderer.create(<Provider store={store}>
      <CardWrapper container={container} highlights={[highlight]} />
    </Provider>);

    expect(() => component.unmount()).not.toThrow();
  });

  it('handles useKeyCombination - focus highlight in the content', () => {
    const document = assertDocument();
    const highlight = createMockHighlight();
    const highlightElement = document.createElement('span');
    container.appendChild(highlightElement);

    const cardWrapperElement = document.createElement('div');
    const cardElement = document.createElement('div');
    cardWrapperElement.append(cardElement);

    store.dispatch(focusHighlight(highlight.id));

    renderer.create(<Provider store={store}>
      <CardWrapper container={container} highlights={[highlight]} />
    </Provider>, { createNodeMock: () => cardWrapperElement });

    renderer.act(() => undefined);

    expect(store.getState().content.highlights.currentPage.focused).toEqual(highlight.id);

    renderer.act(() => {
      dispatchHighlightToggle(cardElement);
    });

    expect(highlight.focus).toHaveBeenCalled();
  });

  it('handles useKeyCombination - focus card and then handles useFocusLost - unfocus card', () => {
    const document = assertDocument();
    const highlight = createMockHighlight();
    const highlightElement = document.createElement('span');

    container.appendChild(highlightElement);
    highlight.elements.push(highlightElement);

    const cardWrapperElement = document.createElement('div');

    store.dispatch(focusHighlight(highlight.id));

    const component = renderer.create(<Provider store={store}>
      <CardWrapper container={container} highlights={[highlight]} />
    </Provider>, { createNodeMock: () => cardWrapperElement });

    renderer.act(() => {
      const card = component.root.findByType(Card);
      expect(card.props.shouldFocusCard).toEqual(false);
    });

    renderer.act(() => {
      dispatchHighlightToggle(highlightElement);
    });

    renderer.act(() => {
      const card = component.root.findByType(Card);
      expect(card.props.shouldFocusCard).toEqual(true);
    });

    expect(highlight.focus).toHaveBeenCalled();

    const elementOutside = document.createElement('span');

    renderer.act(() => {
      dispatchFocusOutEvent(assertWindow(), cardWrapperElement, elementOutside);
    });

    renderer.act(() => {
      const card = component.root.findByType(Card);
      expect(card.props.shouldFocusCard).toEqual(false);
    });
  });

  it('handles useKeyCombination - hide/unhide cards', () => {
    const document = assertDocument();
    const highlight1 = createMockHighlight('id1');
    const highlight2 = createMockHighlight('id2');
    const highlightElement1 = document.createElement('span');
    const highlightElement2 = document.createElement('span');
    const selectionHighlight = { id: 'string', elements: [] };

    highlight1.elements.push(highlightElement1);
    highlight2.elements.push(highlightElement2);
    container.appendChild(highlightElement1);
    container.appendChild(highlightElement2);
    renderer.create(
      <Provider store={store}>
        <OnEsc />
        <CardWrapper
          container={container}
          highlights={[highlight1, highlight2, selectionHighlight]}
        />
      </Provider>
    );

    // These tests get code coverage but do not update the highlight structures
    // so that we can see that they worked as expected
    renderer.act(() => { store.dispatch(clearFocusedHighlight()); });

    // Expect cards to be hidden
    renderer.act(() => {
      // Simulate pressing Escape to hide card
      dispatchKeyDownEvent({
        key: 'Escape',
        target: document.body,
      });
    });

    renderer.act(() => {
      store.dispatch(focusHighlight(highlight1.id));
    });

    renderer.act(() => {
      // Simulate pressing Escape to hide card
      dispatchKeyDownEvent({
        key: 'Escape',
        target: document.body,
      });
    });

    // Expect cards to be visible again
    renderer.act(() => {
      // Simulate pressing Enter to unhide cards
      dispatchKeyDownEvent({
        key: 'Enter',
        target: highlightElement1,
      });
    });

    renderer.act(() => {
      // Simulate pressing Tab to unhide all cards
      dispatchKeyDownEvent({
        key: 'Tab',
        target: highlightElement1,
      });
    });

    renderer.act(() => {
      store.dispatch(focusHighlight('string'));
    });

    renderer.act(() => {
      // Simulate pressing Escape to hide card
      dispatchKeyDownEvent({
        key: 'Escape',
        target: document.body,
      });
    });

    // Trigger editOnEnter with no focusedHighlight
    renderer.act(() => {
      dispatchKeyDownEvent({
        key: 'Enter',
      });
    });

    renderer.act(() => {
      document?.dispatchEvent(new CustomEvent('showCardEvent', { bubbles: true }));
    });
    renderer.act(() => {
      document?.dispatchEvent(new CustomEvent('hideCardEvent', { bubbles: true }));
    });
  });

  it(
    'handles useKeyCombination - noop if trigerred in element that we dont support '
    + 'or with another key combination',
    () => {
      const document = assertDocument();
      const highlight = createMockHighlight();
      const highlightElement = document.createElement('span');
      container.appendChild(highlightElement);

      const textarea = document.createElement('textarea');
      container.appendChild(textarea);

      const elementInsideContainer = document.createElement('div');
      container.appendChild(elementInsideContainer);

      const elementOutsideOfTheContainer = document.createElement('div');
      document.body.appendChild(elementOutsideOfTheContainer);

      const cardWrapperElement = document.createElement('div');

      store.dispatch(focusHighlight(highlight.id));

      const component = renderer.create(<Provider store={store}>
        <CardWrapper container={container} highlights={[highlight]} />
      </Provider>, { createNodeMock: () => cardWrapperElement });

      renderer.act(() => {
        const card = component.root.findByType(Card);
        expect(card.props.shouldFocusCard).toEqual(false);
      });

      renderer.act(() => {
        dispatchHighlightToggle(textarea);

        dispatchHighlightToggle(elementOutsideOfTheContainer);

        dispatchKeyDownEvent({ key: 'anotherkeythatwedontsupport', target: elementInsideContainer });
      });

      renderer.act(() => {
        const card = component.root.findByType(Card);
        expect(card.props.shouldFocusCard).toEqual(false);
      });

      expect(highlight.focus).not.toHaveBeenCalled();
    });

  it('handles useKeyCombination - noop if focusedHighlight is undefined', () => {
    const document = assertDocument();
    const highlight = createMockHighlight();
    const highlightElement = document.createElement('span');
    container.appendChild(highlightElement);

    const cardWrapperElement = document.createElement('div');
    const cardElement = document.createElement('div');
    cardWrapperElement.append(cardElement);

    renderer.create(<Provider store={store}>
      <CardWrapper container={container} highlights={[highlight]} />
    </Provider>, { createNodeMock: () => cardWrapperElement });

    renderer.act(() => undefined);

    expect(store.getState().content.highlights.currentPage.focused).toEqual(undefined);

    renderer.act(() => {
      dispatchHighlightToggle(cardElement);
    });

    expect(highlight.focus).not.toHaveBeenCalled();
  });

  it('handles useKeyCombination - noop if event.target is undefined', () => {
    const document = assertDocument();
    const highlight = createMockHighlight();
    const highlightElement = document.createElement('span');
    container.appendChild(highlightElement);

    const cardWrapperElement = document.createElement('div');
    const cardElement = document.createElement('div');
    cardWrapperElement.append(cardElement);

    store.dispatch(focusHighlight(highlight.id));

    renderer.create(<Provider store={store}>
      <CardWrapper container={container} highlights={[highlight]} />
    </Provider>, { createNodeMock: () => cardWrapperElement });

    renderer.act(() => undefined);

    expect(store.getState().content.highlights.currentPage.focused).toEqual(highlight.id);

    renderer.act(() => {
      dispatchHighlightToggle(undefined);
    });

    expect(highlight.focus).not.toHaveBeenCalled();
  });

  it('handles useKeyCombination - noop if element.current is undefined', () => {
    const document = assertDocument();
    const highlight = createMockHighlight();
    const highlightElement = document.createElement('span');
    container.appendChild(highlightElement);

    const cardWrapperElement = document.createElement('div');
    const cardElement = document.createElement('div');
    cardWrapperElement.append(cardElement);

    store.dispatch(focusHighlight(highlight.id));

    renderer.create(<Provider store={store}>
      <CardWrapper container={container} highlights={[highlight]} />
    </Provider>, { createNodeMock: () => undefined });

    renderer.act(() => undefined);

    expect(store.getState().content.highlights.currentPage.focused).toEqual(highlight.id);

    renderer.act(() => {
      dispatchKeyDownEvent({ key: highlightKeyCombination.key!, target: cardElement });
    });

    expect(highlight.focus).not.toHaveBeenCalled();
  });

  it('does not focus highlight on mouseup if selection is collapsed', () => {
    const highlights = [createMockHighlight('id1'), createMockHighlight('id2')];
    const dispatchSpy = jest.fn();
    renderer.act(() => {
      renderer.create(
        <Provider store={store}>
          <CardWrapper
            container={container}
            highlights={highlights}
            dispatch={dispatchSpy}
          />
        </Provider>
      );
    });
    const node = assertDocument().getRootNode();
    const compareDocumentPositionMock = jest.fn().mockReturnValue(node.DOCUMENT_POSITION_FOLLOWING);

    const selectionMock = {
      isCollapsed: true,
      anchorNode: {
        compareDocumentPosition: compareDocumentPositionMock,
      },
      focusNode: {
        compareDocumentPosition: compareDocumentPositionMock,
      },
    };
    const getSelectionSpy = jest.spyOn(window!, 'getSelection').mockReturnValue(selectionMock as any);

    renderer.act(() => {
      document?.dispatchEvent(new (window as any).MouseEvent('mouseup'));
    });

    expect(dispatchSpy).not.toHaveBeenCalled();

    getSelectionSpy.mockRestore();
  });

  it('does nothing on mouseup if there are no highlights', () => {
    const dispatchSpy = jest.fn();
    renderer.act(() => {
      renderer.create(
        <Provider store={store}>
          <CardWrapper
            container={container}
            highlights={[]}
            dispatch={dispatchSpy}
          />
        </Provider>
      );
    });
    const node = assertDocument().getRootNode();

    const selectionMock = {
      isCollapsed: false,
      anchorNode: {
        compareDocumentPosition: jest.fn().mockReturnValue(node.DOCUMENT_POSITION_FOLLOWING),
      },
    };
    const getSelectionSpy = jest.spyOn(window!, 'getSelection').mockReturnValue(selectionMock as any);

    renderer.act(() => {
      document?.dispatchEvent(new (window as any).MouseEvent('mouseup'));
    });

    expect(dispatchSpy).not.toHaveBeenCalled();

    getSelectionSpy.mockRestore();
  });

  describe('ResizeObserver polyfill', () => {
    it('loads', () => {
      renderer.create(<Provider store={store}>
        <CardWrapper container={container} highlights={[]} />
      </Provider>);

      runHooks(renderer);

      expect(usesResizeObserverPolyfill).toBe(true);
    });
  });

  describe('MaybeWrapper', () => {
    let wrapperStore: Store;
    let wrapperContainer: HTMLElement;

    beforeEach(() => {
      wrapperStore = createTestStore();
      wrapperContainer = assertDocument().createElement('div');
      assertDocument().body.appendChild(wrapperContainer);
    });

    afterEach(() => {
      wrapperContainer.remove();
    });

    it('renders Wrapper when there is a valid text highlight', () => {
      const highlight = {
        ...createMockHighlight(),
        content: '<span>ValidText123</span>',
      };
      const component = renderer.create(
        <Provider store={wrapperStore}>
          <CardWrapper container={wrapperContainer} highlights={[highlight]} />
        </Provider>
      );
      expect(component.toJSON()).not.toBeNull();
    });

    it('renders Wrapper when there is a highlight with an image', () => {
      const highlight = {
        ...createMockHighlight(),
        content: '<img src="img.png"/>',
      };
      const component = renderer.create(
        <Provider store={wrapperStore}>
          <CardWrapper container={wrapperContainer} highlights={[highlight]} />
        </Provider>
      );
      expect(component.toJSON()).not.toBeNull();
    });

    it('renders Wrapper when there is a highlight with MathJax', () => {
      const highlight = {
        ...createMockHighlight(),
        content: '<span class="MathJax">math</span>',
      };
      const component = renderer.create(
        <Provider store={wrapperStore}>
          <CardWrapper container={wrapperContainer} highlights={[highlight]} />
        </Provider>
      );
      expect(component.toJSON()).not.toBeNull();
    });

    it('does not render Wrapper when all highlights are empty', () => {
      const highlight = {
        ...createMockHighlight(),
        content: '',
      };
      const component = renderer.create(
        <Provider store={wrapperStore}>
          <CardWrapper container={wrapperContainer} highlights={[highlight]} />
        </Provider>
      );
      expect(component.toJSON()).toBeNull();
    });

    it('does not render Wrapper when all highlights have only whitespace', () => {
      const highlight = {
        ...createMockHighlight(),
        content: '   ',
      };
      const component = renderer.create(
        <Provider store={wrapperStore}>
          <CardWrapper container={wrapperContainer} highlights={[highlight]} />
        </Provider>
      );
      expect(component.toJSON()).toBeNull();
    });

    it('does not render Wrapper when all highlights have non-string content', () => {
      const highlight = {
        ...createMockHighlight(),
        content: undefined,
      };
      const component = renderer.create(
        <Provider store={wrapperStore}>
          <CardWrapper container={wrapperContainer} highlights={[highlight]} />
        </Provider>
      );
      expect(component.toJSON()).toBeNull();
    });

    it('renders Wrapper when at least one highlight is valid among invalid ones', () => {
      const validHighlight = {
        ...createMockHighlight(),
        content: '<span>ValidText</span>',
      };
      const invalidHighlight = {
        ...createMockHighlight(),
        content: '',
      };
      const component = renderer.create(
        <Provider store={wrapperStore}>
          <CardWrapper container={wrapperContainer} highlights={[invalidHighlight, validHighlight]} />
        </Provider>
      );
      expect(component.toJSON()).not.toBeNull();
    });

    it('renders Wrapper when highlight is valid with math characters', () => {
      const validHighlight = {
        ...createMockHighlight(),
        content: '<span>∑ π ∫</span>',
      };
      const component = renderer.create(
        <Provider store={wrapperStore}>
          <CardWrapper container={wrapperContainer} highlights={[validHighlight]} />
        </Provider>
      );
      expect(component.toJSON()).not.toBeNull();
    });
  });

  describe('handleGlobalMouseUp', () => {
    let mockedStore: Store;
    let mockedContainer: HTMLElement;
    let dispatchSpy: jest.Mock;

    beforeEach(() => {
      mockedStore = createTestStore();
      mockedContainer = assertDocument().createElement('div');
      assertDocument().body.appendChild(mockedContainer);
      dispatchSpy = jest.fn();
    });

    afterEach(() => {
      mockedContainer.remove();
      jest.restoreAllMocks();
    });

    it('does nothing if processedEvents has event', () => {
      renderer.create(
        <Provider store={mockedStore}>
          <CardWrapper container={mockedContainer} highlights={[createMockHighlight('id1')]} dispatch={dispatchSpy} />
        </Provider>
      );

      const event = new CustomEvent('mouseup');
      const dispatchEventSpy = jest.spyOn(mockedContainer, 'dispatchEvent');
      renderer.act(() => {
        document?.dispatchEvent(event);
      });

      expect(dispatchEventSpy).not.toHaveBeenCalled();
    });

    it('does nothing if selection is collapsed', () => {
      renderer.create(
        <Provider store={mockedStore}>
          <CardWrapper container={mockedContainer} highlights={[createMockHighlight('id1')]} dispatch={dispatchSpy} status='visible' />
        </Provider>
      );

      const selectionMock = {
        isCollapsed: true,
        anchorNode: {
          compareDocumentPosition: jest.fn().mockReturnValue(0),
        },
        focusNode: {},
      };
      const getSelectionSpy = jest.spyOn(window!, 'getSelection').mockReturnValue(selectionMock as any);

      renderer.act(() => {
        document?.dispatchEvent(new (window as any).MouseEvent('mouseup'));
      });

      expect(dispatchSpy).not.toHaveBeenCalled();
      getSelectionSpy.mockRestore();
    });

    it('does nothing if event target is inside the wrapper', () => {
      const dispatchSpy = jest.fn();
      const divInside = assertDocument().createElement('div');
      const cardWrapperElement = assertDocument().createElement('div');
      cardWrapperElement.appendChild(divInside);

      renderer.create(
        <Provider store={mockedStore}>
          <CardWrapper container={mockedContainer} highlights={[createMockHighlight('id1')]} dispatch={dispatchSpy} status='visible' />
        </Provider>,
        { createNodeMock: () => cardWrapperElement }
      );

      // Flush effects to register the ref
      renderer.act(() => undefined);

      const event = new (assertWindow() as any).MouseEvent('mouseup', { bubbles: true });
      Object.defineProperty(event, 'target', { value: divInside });

      renderer.act(() => {
        assertDocument().dispatchEvent(event);
      });

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('dispatches simulated mouseup event if selection is not collapsed', () => {
      let unmount: () => void;

      renderer.act(() => {
        const rendered = renderer.create(
          <Provider store={mockedStore}>
            <CardWrapper container={mockedContainer} highlights={[createMockHighlight('id1')]} dispatch={dispatchSpy} />
          </Provider>
        );
        unmount = rendered.unmount;
      });

      const node = assertDocument().getRootNode();
      const selectionMock = {
        isCollapsed: false,
        anchorNode: {
          compareDocumentPosition: jest.fn().mockReturnValue(node.DOCUMENT_POSITION_FOLLOWING),
        },
        focusNode: {},
        toString: () => 'some text',
      };
      const getSelectionSpy = jest.spyOn(window!, 'getSelection').mockReturnValue(selectionMock as any);

      const dispatchEventSpy = jest.spyOn(mockedContainer, 'dispatchEvent');

      renderer.act(() => {
        document?.dispatchEvent(new (window as any).MouseEvent('mouseup'));
      });

      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent));

      getSelectionSpy.mockRestore();

      renderer.act(() => {
        unmount();
      });
    });
  });

  describe('position preservation and offset adjustment logic', () => {
    const document = assertDocument();

    it('preserves position when highlight already has position in initialPositions', () => {
      // Create 3 existing highlights plus 1 NEW highlight (no elements)
      const highlights = [
        createMockHighlight('h1'),
        createMockHighlight('h2'),
        createMockHighlight('h3-new'), // This will be the NEW highlight
        createMockHighlight('h4'),
      ];
      // h1, h2, h4 are existing (have elements), h3 is new (no elements)
      highlights[0].elements = [document.createElement('span') as any];
      highlights[1].elements = [document.createElement('span') as any];
      highlights[2].elements = []; // NEW highlight
      highlights[3].elements = [document.createElement('span') as any];

      const highlightsPositionsInDocument = [0, 100, 200, 300];
      jest.spyOn(cardUtils, 'getHighlightOffset')
        .mockImplementation((_container: any, highlight: Highlight) => {
          const top = highlightsPositionsInDocument[highlights.findIndex((search) => search.id === highlight.id)];
          return { bottom: top, top };
        });

      const component = renderer.create(<Provider store={store}>
        <CardWrapper container={container} highlights={highlights} />
      </Provider>);

      const [card1, card2, card3, card4] = component.root.findAllByType(Card);

      // Set heights for all cards
      renderer.act(() => {
        card1.props.onHeightChange({ current: { offsetHeight: 50 } });
        card2.props.onHeightChange({ current: { offsetHeight: 50 } });
        card3.props.onHeightChange({ current: { offsetHeight: 50 } });
        card4.props.onHeightChange({ current: { offsetHeight: 50 } });
      });

      // Focus h3 (NEW highlight, no elements) - this triggers the offset adjustment flow
      // which calls updateStackedCardsPositions twice:
      // 1. First call (line 203): calculates all positions (h1, h2, h3, h4)
      // 2. Second call (line 265): processes highlightsAfterFocused (h4) with initialPositions
      // The condition at line 98 should preserve h4's position from the first call
      renderer.act(() => {
        store.dispatch(focusHighlight(highlights[2].id));
      });

      // Verify positions are defined and the code path executed successfully
      // The main goal is to ensure the initialPositions preservation logic runs without errors
      // After focusing NEW highlight h3, offset adjustment shifts cards by +25:
      expect(card1.props.topOffset).toBe(0);    // -25 (centered) + 25 (offset) = 0
      expect(card2.props.topOffset).toBe(75);   // 75 (centered), no change
      expect(card3.props.topOffset).toBe(200);  // 175 (centered) + 25 (offset) = 200
      expect(card4.props.topOffset).toBe(275);  // 275 (centered), not affected
    });

    it('covers preferEnd true branch with text selection', () => {
      // Create a NEW highlight (no elements = fresh text selection)
      const highlight = createMockHighlight('new-highlight');
      highlight.elements = []; // NEW highlight has no DOM elements yet

      jest.spyOn(cardUtils, 'getHighlightOffset')
        .mockReturnValue({ bottom: 100, top: 50 });

      // Mock window.getSelection() to return a selection with anchorNode and focusNode
      const anchorNode = document.createElement('div');
      const focusNode = document.createElement('div');
      const node = assertDocument().getRootNode();

      // Stub compareDocumentPosition to return DOCUMENT_POSITION_FOLLOWING
      // This ensures preferEnd evaluates to true (forward selection)
      anchorNode.compareDocumentPosition = jest.fn().mockReturnValue(node.DOCUMENT_POSITION_FOLLOWING);

      const selectionMock = {
        anchorNode,
        focusNode,
        anchorOffset: 0,
        focusOffset: 10,
      };
      const getSelectionSpy = jest.spyOn(window!, 'getSelection').mockReturnValue(selectionMock as any);

      const component = renderer.create(<Provider store={store}>
        <CardWrapper container={container} highlights={[highlight]} />
      </Provider>);

      const card = component.root.findByType(Card);

      // Set height and focus the new highlight
      renderer.act(() => {
        card.props.onHeightChange({ current: { offsetHeight: 80 } });
        store.dispatch(focusHighlight(highlight.id));
      });

      // With preferEnd = true, the offset calculation:
      // - Centered offset = top + (height/2) - (cardHeight/2) = 50 + 25 - 40 = 35
      // - Target (preferEnd) = bottom - 120 = 100 - 120 = -20
      // - offsetToAdjust = 35 - (-20) = 55
      // - Final position = 35 - 55 = -20
      expect(card.props.topOffset).toBe(-20);

      getSelectionSpy.mockRestore();
    });

    it('covers early break in repositioning loop when cards have sufficient space', () => {
      // Create highlights with large gaps between them
      const highlights = [
        createMockHighlight('h1'),
        createMockHighlight('h2'),
        createMockHighlight('h3'),
      ];
      // Make h3 a NEW highlight (no elements)
      highlights[0].elements = [document.createElement('span') as any];
      highlights[1].elements = [document.createElement('span') as any];
      highlights[2].elements = []; // NEW highlight

      // Position them with large gaps: 0, 200, 500
      const highlightsPositionsInDocument = [0, 200, 500];
      jest.spyOn(cardUtils, 'getHighlightOffset')
        .mockImplementation((_container: any, highlight: Highlight) => {
          const top = highlightsPositionsInDocument[highlights.findIndex((search) => search.id === highlight.id)];
          return { bottom: top, top };
        });

      const component = renderer.create(<Provider store={store}>
        <CardWrapper container={container} highlights={highlights} />
      </Provider>);

      const [card1, card2, card3] = component.root.findAllByType(Card);

      // Set heights
      renderer.act(() => {
        card1.props.onHeightChange({ current: { offsetHeight: 50 } });
        card2.props.onHeightChange({ current: { offsetHeight: 50 } });
        card3.props.onHeightChange({ current: { offsetHeight: 50 } });
      });

      // Focus the new highlight h3
      renderer.act(() => {
        store.dispatch(focusHighlight(highlights[2].id));
      });

      // Expected positions (highlights have 0 height, cards have 50px height):
      // Initial calculation:
      // - h1: centered at 0 + 0/2 - 50/2 = -25, but starts at 0 (first card, no stacking)
      // - h2: centered at 200 - 25 = 175, stacking from h1 end (50): max(175, 50) = 175
      // - h3: centered at 500 - 25 = 475, stacking from h2 end (225): max(475, 225) = 475
      // After focusing h3, offset adjustment targets h3.top = 500
      // offsetToAdjust = 475 - 500 = -25
      // Adjusted h3 = 475 - (-25) = 500
      // h2 and h1 need to check if they overlap with adjusted h3 (500)
      // h2 at 175 with height 50 ends at 225, which is < 500, so break (line 254 evaluates true)
      expect(card1.props.topOffset).toBe(0);
      expect(card2.props.topOffset).toBe(175);
      expect(card3.props.topOffset).toBe(500);
    });

  });
});
