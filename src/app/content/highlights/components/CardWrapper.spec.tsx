import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import createMockHighlight from '../../../../test/mocks/highlight';
import * as domUtils from '../../../domUtils';
import { Store } from '../../../types';
import { assertDocument, remsToPx } from '../../../utils';
import { assertWindow } from '../../../utils/browser-assertions';
import { clearFocusedHighlight, focusHighlight } from '../actions';
import { cardMarginBottom, highlightKeyCombination } from '../constants';
import Card from './Card';
import CardWrapper from './CardWrapper';

jest.mock('./Card', () => (props: any) => <span data-mock-card {...props} />);

jest.mock('./cardUtils', () => ({
  ...jest.requireActual('./cardUtils'),
  getHighlightOffset: jest.fn(() => ({ top: 100, bottom: 100 })),
}));

describe('CardWrapper', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('matches snapshot', () => {
    const component = renderer.create(<Provider store={store}>
      <CardWrapper highlights={[createMockHighlight('id1')]} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when there is no highlights', () => {
    const component = renderer.create(<Provider store={store}>
      <CardWrapper highlights={[]} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders cards', () => {
    const component = renderer.create(<Provider store={store}>
      <CardWrapper highlights={[createMockHighlight(), createMockHighlight()]} />
    </Provider>);

    expect(component.root.findAllByType(Card).length).toBe(2);
  });

  it('scrolls to card when focused', () => {
    const scrollIntoView = jest.spyOn(domUtils, 'scrollIntoView');
    scrollIntoView.mockImplementation(() => null);

    const highlight = {
      ...createMockHighlight(),
      elements: ['something'],
    };

    renderer.create(<Provider store={store}>
      <CardWrapper highlights={[highlight]} />
    </Provider>);

    renderer.act(() => {
      store.dispatch(focusHighlight(highlight.id));
    });

    expect(scrollIntoView).toHaveBeenCalled();
    scrollIntoView.mockClear();
  });

  it('do not scroll to card when focused if it does not have elements', () => {
    const scrollIntoView = jest.spyOn(domUtils, 'scrollIntoView');
    scrollIntoView.mockImplementation(() => null);

    const highlight = {
      ...createMockHighlight(),
      elements: [],
    };

    renderer.create(<Provider store={store}>
      <CardWrapper highlights={[highlight]} />
    </Provider>);

    renderer.act(() => {
      store.dispatch(focusHighlight(highlight.id));
    });

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('do not scroll to focused card after rerender if focused highlight is the same', () => {
    const scrollIntoView = jest.spyOn(domUtils, 'scrollIntoView');
    scrollIntoView.mockImplementation(() => null);

    const highlight = {
      ...createMockHighlight(),
      elements: ['something'],
    };
    const highlight2 = {
      ...createMockHighlight(),
      elements: ['else'],
    };
    const highlight3 = {
      ...createMockHighlight(),
      elements: ['woops'],
    };

    const component = renderer.create(<Provider store={store}>
      <CardWrapper highlights={[highlight, highlight2]} />
    </Provider>);

    renderer.act(() => {
      store.dispatch(focusHighlight(highlight.id));
    });

    expect(scrollIntoView).toHaveBeenCalled();
    scrollIntoView.mockClear();

    component.update(<Provider store={store}>
      <CardWrapper highlights={[highlight, highlight2, highlight3]} />
    </Provider>);

    // make sure that useEffect is called
    // tslint:disable-next-line: no-empty
    renderer.act(() => {});

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('updates top offset for main wrapper if it is required', () => {
    const div = assertDocument().createElement('div');
    const createNodeMock = () => div;

    const highlight = () => ({
      ...createMockHighlight(),
      range: {
        getBoundingClientRect: () => ({ top: 100 }),
      },
    });

    const component = renderer.create(<Provider store={store}>
      <CardWrapper highlights={[highlight(), highlight(), highlight()]} />
    </Provider>, {createNodeMock});

    // Wait for React.useEffect
    renderer.act(() => undefined);

    expect(div.style.transform).toEqual('');

    // Update positions - currently all cards are in the same position
    // after onHeightChange their positions will be recalculated
    renderer.act(() => {
      component.root.findAllByType(Card)
        .forEach((card) => card.props.onHeightChange({ current: { offsetHeight: 100 }}));
    });

    // Position of last card is now 340px - all highlights are positioned 100px from the top
    // Which mean that position of first card is at 100px offsetTop. Since all cards have 100px height
    // and there is 20px margin between cards, we end up having 340px offsetTop for third card.
    renderer.act(() => {
      const [, , card] = component.root.findAllByType(Card);
      expect(card.props.topOffset).toEqual(340);
      store.dispatch(focusHighlight(card.props.highlight.id));
    });

    // When we focus third card then main wrapper should move to the top for 340px - 100px
    // which is equal to third card position - topOffset for this highlight.

    expect(div.style.transform).toEqual('translateY(-240px)');
  });

  it(`handles card's height changes`, () => {
    const component = renderer.create(<Provider store={store}>
      <CardWrapper highlights={[createMockHighlight(), createMockHighlight()]} />
    </Provider>);

    const [card1, card2] = component.root.findAllByType(Card);
    expect(card1.props.topOffset).toEqual(undefined);
    expect(card2.props.topOffset).toEqual(undefined);

    // Update state with a height
    renderer.act(() => {
      card1.props.onHeightChange({ current: { offsetHeight: 100 }});
      card2.props.onHeightChange({ current: { offsetHeight: 100 }});
    });
    // We are starting at 100 because of getHighlightTopOffset mock
    expect(card1.props.topOffset).toEqual(100);
    expect(card2.props.topOffset).toEqual(100 + 100 + remsToPx(cardMarginBottom));

    // Noops when height is the same
    renderer.act(() => {
      card1.props.onHeightChange({ current: { offsetHeight: 100 }});
    });
    expect(card1.props.topOffset).toEqual(100);
    expect(card2.props.topOffset).toEqual(100 + 100 + remsToPx(cardMarginBottom));

    // Handle null value
    renderer.act(() => {
      card1.props.onHeightChange({ current: { offsetHeight: null }});
    });
    // First card have null height so secondcard starts at the highlight top offset
    expect(card1.props.topOffset).toEqual(100);
    expect(card2.props.topOffset).toEqual(100);

    expect(() => component.root.findAllByType(Card)).not.toThrow();
  });

  it('resets top offset on clear focused highlight', () => {
    const div = assertDocument().createElement('div');
    const createNodeMock = () => div;
    const highlight = createMockHighlight();
    const highlight2 = createMockHighlight();

    const component = renderer.create(<Provider store={store}>
      <CardWrapper highlights={[highlight, highlight2]} />
    </Provider>, {createNodeMock});

    const [card1, card2] = component.root.findAllByType(Card);

    renderer.act(() => {
      card1.props.onHeightChange({ current: { offsetHeight: 100 }});
      card2.props.onHeightChange({ current: { offsetHeight: 100 }});
      store.dispatch(focusHighlight(highlight2.id));
    });

    expect(div.style.transform).toEqual('translateY(-120px)');

    renderer.act(() => {
      store.dispatch(clearFocusedHighlight());
    });

    expect(div.style.transform).toEqual('');
  });

  it('does not reset topOffset when focused another highlight', () => {
    const div = assertDocument().createElement('div');
    const createNodeMock = () => div;
    const highlight = createMockHighlight();
    const highlight2 = createMockHighlight();
    const highlight3 = createMockHighlight();

    const component = renderer.create(<Provider store={store}>
      <CardWrapper highlights={[highlight, highlight2, highlight3]} />
    </Provider>, {createNodeMock});

    const [card1, card2, card3] = component.root.findAllByType(Card);

    renderer.act(() => {
      card1.props.onHeightChange({ current: { offsetHeight: 100 }});
      card2.props.onHeightChange({ current: { offsetHeight: 100 }});
      card3.props.onHeightChange({ current: { offsetHeight: 100 }});
      store.dispatch(focusHighlight(highlight2.id));
    });

    expect(div.style.transform).toEqual('translateY(-120px)');

    renderer.act(() => {
      store.dispatch(focusHighlight(highlight3.id));
    });

    expect(div.style.transform).toEqual('translateY(-240px)');
  });

  it('does not throw on unmount when highlight is focused', () => {
    const highlight = createMockHighlight();
    store.dispatch(focusHighlight(highlight.id));

    const component = renderer.create(<Provider store={store}>
      <CardWrapper highlights={[highlight]} />
    </Provider>);

    expect(() => component.unmount()).not.toThrow();
  });

  it('handles useKeyCombination - focus highlight in the content', () => {
    const window = assertWindow();
    const document = assertDocument();
    const highlight = createMockHighlight();
    const highlightElement = document.createElement('span');
    document.body.appendChild(highlightElement);

    const cardWrapperElement = document.createElement('div');
    const cardElement = document.createElement('div');
    cardWrapperElement.append(cardElement);

    store.dispatch(focusHighlight(highlight.id));

    renderer.create(<Provider store={store}>
      <CardWrapper highlights={[highlight]} />
    </Provider>, { createNodeMock: () => cardWrapperElement });

    renderer.act(() => undefined);

    expect(store.getState().content.highlights.currentPage.focused).toEqual(highlight.id);

    const keyboardEvent = window.document.createEvent('KeyboardEvent');
    keyboardEvent.initKeyboardEvent('keydown', true, true, window, highlightKeyCombination.key!, 0, '', false, '');
    Object.defineProperty(keyboardEvent, 'target', { value: cardElement });
    document.dispatchEvent(keyboardEvent);

    expect(highlight.focus).toHaveBeenCalled();
  });

  it('handles useKeyCombination - focus card and then handles useFocusLost - unfocus card', () => {
    const window = assertWindow();
    const document = assertDocument();
    const highlight = createMockHighlight();
    const highlightElement = document.createElement('span');
    document.body.appendChild(highlightElement);

    const cardWrapperElement = document.createElement('div');

    store.dispatch(focusHighlight(highlight.id));

    const component = renderer.create(<Provider store={store}>
      <CardWrapper highlights={[highlight]} />
    </Provider>, { createNodeMock: () => cardWrapperElement });

    renderer.act(() => {
      const card = component.root.findByType(Card);
      expect(card.props.shouldFocusCard).toEqual(false);
    });

    const keyboardEvent = window.document.createEvent('KeyboardEvent');
    keyboardEvent.initKeyboardEvent('keydown', true, true, window, highlightKeyCombination.key!, 0, '', false, '');
    Object.defineProperty(keyboardEvent, 'target', { value: highlightElement });
    document.dispatchEvent(keyboardEvent);

    renderer.act(() => {
      const card = component.root.findByType(Card);
      expect(card.props.shouldFocusCard).toEqual(true);
    });

    expect(highlight.focus).not.toHaveBeenCalled();

    const elementOutside = document.createElement('span');

    const focusOutEvent = window.document.createEvent('FocusEvent');
    focusOutEvent.initEvent('focusout', true, true);
    Object.defineProperty(focusOutEvent, 'relatedTarget', { value: elementOutside });
    cardWrapperElement.dispatchEvent(focusOutEvent);

    renderer.act(() => {
      const card = component.root.findByType(Card);
      expect(card.props.shouldFocusCard).toEqual(false);
    });
  });

  it(
    'handles useKeyCombination - noop if trigerred in element that we dont support '
    + 'or with another key combination',
    () => {
    const window = assertWindow();
    const document = assertDocument();
    const highlight = createMockHighlight();
    const highlightElement = document.createElement('span');
    document.body.appendChild(highlightElement);

    const cardWrapperElement = document.createElement('div');

    store.dispatch(focusHighlight(highlight.id));

    const component = renderer.create(<Provider store={store}>
      <CardWrapper highlights={[highlight]} />
    </Provider>, { createNodeMock: () => cardWrapperElement });

    renderer.act(() => {
      const card = component.root.findByType(Card);
      expect(card.props.shouldFocusCard).toEqual(false);
    });

    const textarea = document.createElement('textarea');
    const input = document.createElement('input');
    input.setAttribute('type', 'text');

    const textareaEvent = window.document.createEvent('KeyboardEvent');
    textareaEvent.initKeyboardEvent('keydown', true, true, window, highlightKeyCombination.key!, 0, '', false, '');
    Object.defineProperty(textareaEvent, 'target', { value: textarea });
    document.dispatchEvent(textareaEvent);

    const inputEvent = window.document.createEvent('KeyboardEvent');
    inputEvent.initKeyboardEvent('keydown', true, true, window, highlightKeyCombination.key!, 0, '', false, '');
    Object.defineProperty(inputEvent, 'target', { value: input });
    document.dispatchEvent(inputEvent);

    const anotherKeyEvent = window.document.createEvent('KeyboardEvent');
    anotherKeyEvent.initKeyboardEvent('keydown', true, true, window, 'anotherkeythatwedontsupport', 0, '', false, '');
    Object.defineProperty(anotherKeyEvent, 'target', { value: document.createElement('span') });
    document.dispatchEvent(anotherKeyEvent);

    renderer.act(() => {
      const card = component.root.findByType(Card);
      expect(card.props.shouldFocusCard).toEqual(false);
    });

    expect(highlight.focus).not.toHaveBeenCalled();
  });

  it('handles useKeyCombination - noop if focusedHighlight is undefined', () => {
    const window = assertWindow();
    const document = assertDocument();
    const highlight = createMockHighlight();
    const highlightElement = document.createElement('span');
    document.body.appendChild(highlightElement);

    const cardWrapperElement = document.createElement('div');
    const cardElement = document.createElement('div');
    cardWrapperElement.append(cardElement);

    renderer.create(<Provider store={store}>
      <CardWrapper highlights={[highlight]} />
    </Provider>, { createNodeMock: () => cardWrapperElement });

    renderer.act(() => undefined);

    expect(store.getState().content.highlights.currentPage.focused).toEqual(undefined);

    const keyboardEvent = window.document.createEvent('KeyboardEvent');
    keyboardEvent.initKeyboardEvent('keydown', true, true, window, highlightKeyCombination.key!, 0, '', false, '');
    Object.defineProperty(keyboardEvent, 'target', { value: cardElement });
    document.dispatchEvent(keyboardEvent);

    expect(highlight.focus).not.toHaveBeenCalled();
  });

  it('handles useKeyCombination - noop if event.target is undefined', () => {
    const window = assertWindow();
    const document = assertDocument();
    const highlight = createMockHighlight();
    const highlightElement = document.createElement('span');
    document.body.appendChild(highlightElement);

    const cardWrapperElement = document.createElement('div');
    const cardElement = document.createElement('div');
    cardWrapperElement.append(cardElement);

    store.dispatch(focusHighlight(highlight.id));

    renderer.create(<Provider store={store}>
      <CardWrapper highlights={[highlight]} />
    </Provider>, { createNodeMock: () => cardWrapperElement });

    renderer.act(() => undefined);

    expect(store.getState().content.highlights.currentPage.focused).toEqual(highlight.id);

    const keyboardEvent = window.document.createEvent('KeyboardEvent');
    keyboardEvent.initKeyboardEvent('keydown', true, true, window, highlightKeyCombination.key!, 0, '', false, '');
    Object.defineProperty(keyboardEvent, 'target', { value: undefined });
    document.dispatchEvent(keyboardEvent);

    expect(highlight.focus).not.toHaveBeenCalled();
  });

  it('handles useKeyCombination - noop if element.current is undefined', () => {
    const window = assertWindow();
    const document = assertDocument();
    const highlight = createMockHighlight();
    const highlightElement = document.createElement('span');
    document.body.appendChild(highlightElement);

    const cardWrapperElement = document.createElement('div');
    const cardElement = document.createElement('div');
    cardWrapperElement.append(cardElement);

    store.dispatch(focusHighlight(highlight.id));

    renderer.create(<Provider store={store}>
      <CardWrapper highlights={[highlight]} />
    </Provider>, { createNodeMock: () => undefined });

    renderer.act(() => undefined);

    expect(store.getState().content.highlights.currentPage.focused).toEqual(highlight.id);

    const keyboardEvent = window.document.createEvent('KeyboardEvent');
    keyboardEvent.initKeyboardEvent('keydown', true, true, window, highlightKeyCombination.key!, 0, '', false, '');
    Object.defineProperty(keyboardEvent, 'target', { value: cardElement });
    document.dispatchEvent(keyboardEvent);

    expect(highlight.focus).not.toHaveBeenCalled();
  });
});
