import { Highlight } from '@openstax/highlighter';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import createMockHighlight from '../../../../test/mocks/highlight';
import * as domUtils from '../../../domUtils';
import { Store } from '../../../types';
import { remsToPx } from '../../../utils';
import { focusHighlight } from '../actions';
import { cardMarginBottom } from '../constants';
import Card from './Card';
import * as cardUtils from './cardUtils';
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
      <CardWrapper highlights={highlights} />
    </Provider>);

    const [card1, card2, card3, card4] = component.root.findAllByType(Card);
    expect(card1.props.topOffset).toEqual(undefined);
    expect(card2.props.topOffset).toEqual(undefined);
    expect(card3.props.topOffset).toEqual(undefined);
    expect(card3.props.topOffset).toEqual(undefined);

    // Update state with a height
    renderer.act(() => {
      card1.props.onHeightChange({ current: { offsetHeight: 50 }});
      card2.props.onHeightChange({ current: { offsetHeight: 50 }});
      card3.props.onHeightChange({ current: { offsetHeight: 50 }});
      card4.props.onHeightChange({ current: { offsetHeight: 50 }});
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
      <CardWrapper highlights={[highlight]} />
    </Provider>);

    expect(() => component.unmount()).not.toThrow();
  });
});
