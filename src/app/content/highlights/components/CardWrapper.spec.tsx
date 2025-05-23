import { Highlight } from '@openstax/highlighter';
import { Document, HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import createMockHighlight from '../../../../test/mocks/highlight';
import { dispatchKeyDownEvent } from '../../../../test/reactutils';
import { runHooks } from '../../../../test/utils';
import { Store } from '../../../types';
import { assertDocument, remsToPx } from '../../../utils';
import { assertWindow } from '../../../utils/browser-assertions';
import { focusHighlight } from '../actions';
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
    // We are starting at 100 because of getHighlightTopOffset mock
    expect(card1.props.topOffset).toEqual(100);
    expect(card2.props.topOffset).toEqual(100 + 100 + remsToPx(cardMarginBottom));

    // Noops when height is the same
    renderer.act(() => {
      card1.props.onHeightChange({ current: { offsetHeight: 100 } });
    });
    expect(card1.props.topOffset).toEqual(100);
    expect(card2.props.topOffset).toEqual(100 + 100 + remsToPx(cardMarginBottom));

    // Handle null value
    renderer.act(() => {
      card1.props.onHeightChange({ current: { offsetHeight: null } });
    });
    // First card have null height so secondcard starts at the highlight top offset
    expect(card1.props.topOffset).toEqual(100);
    expect(card2.props.topOffset).toEqual(100);

    expect(() => component.root.findAllByType(Card)).not.toThrow();
  });

  it(`update only these cards that needs it when focusing highlight`, () => {
    const highlights = [createMockHighlight(), createMockHighlight(), createMockHighlight(), createMockHighlight()];
    const highlightsPositionsInDocument = [0, 100, 120, 300];

    jest.spyOn(cardUtils, 'getHighlightOffset')
      .mockImplementation((_container: any, highlight: Highlight) => {
        const top = highlightsPositionsInDocument[highlights.findIndex((search) => search.id === highlight.id)];
        return {
          bottom: top + 20,
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
    expect(card1.props.topOffset).toEqual(0); // first card have only 50px height + 20px margin bottom
    expect(card2.props.topOffset).toEqual(100); // so the second cards starts and the highlight level which is 100
    // highlight for the card3 starts at 120px which is too close to the card2
    // calculated offset will be equal to card2 offset + card2 height + card2 margin bottom = 170px
    expect(card3.props.topOffset).toEqual(170);
    expect(card4.props.topOffset).toEqual(300); // card4 will start at the corresponding highlight level

    // Move card2 and card3 to the top when the card3 is focused - card1 and card4 are not affected
    renderer.act(() => {
      store.dispatch(focusHighlight(card3.props.highlight.id));
    });
    // cards were moved by 70px up (50 is height of the focused card and 20 px is margin bottom)
    expect(card1.props.topOffset).toEqual(0);
    expect(card2.props.topOffset).toEqual(50);
    expect(card3.props.topOffset).toEqual(120);
    expect(card4.props.topOffset).toEqual(300);

    // focusing card1 is not changing position of any cards
    renderer.act(() => {
      store.dispatch(focusHighlight(card1.props.highlight.id));
    });
    // cards were moved by 70px up (50 is height of the focused card and 20 px is margin bottom)
    expect(card1.props.topOffset).toEqual(0);
    expect(card2.props.topOffset).toEqual(100);
    expect(card3.props.topOffset).toEqual(170);
    expect(card4.props.topOffset).toEqual(300);

    // focusing card4 is not changing position of any cards
    renderer.act(() => {
      store.dispatch(focusHighlight(card1.props.highlight.id));
    });
    // cards were moved by 70px up (50 is height of the focused card and 20 px is margin bottom)
    expect(card1.props.topOffset).toEqual(0);
    expect(card2.props.topOffset).toEqual(100);
    expect(card3.props.topOffset).toEqual(170);
    expect(card4.props.topOffset).toEqual(300);

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

    expect(highlight.focus).not.toHaveBeenCalled();

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
    container.appendChild(highlightElement1);
    container.appendChild(highlightElement2);
    const component = renderer.create(
      <Provider store={store}>
        <CardWrapper
          container={container}
          highlights={[highlight1, highlight2]}
        />
      </Provider>
    );

    const cards = component.root.findAllByType(Card);

    // Expect cards to be hidden
    renderer.act(() => {
      // Simulate pressing Escape to hide card
      dispatchKeyDownEvent({
        key: 'Escape',
        target: highlightElement1,
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

    // Expect all cards to be visible
    renderer.act(() => {
      // Simulate pressing Tab to unhide all cards
      dispatchKeyDownEvent({
        key: 'Tab',
        target: highlightElement1,
      });
    });

    expect(cards[0].props.isHidden).toBe(false);
    expect(cards[1].props.isHidden).toBe(false);
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

  describe('ResizeObserver polyfill', () => {
    it('loads', () => {
      renderer.create(<Provider store={store}>
        <CardWrapper container={container} highlights={[]} />
      </Provider>);

      runHooks(renderer);

      expect(usesResizeObserverPolyfill).toBe(true);
    });
  });
});
