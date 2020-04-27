import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import createMockHighlight from '../../../../test/mocks/highlight';
import * as domUtils from '../../../domUtils';
import { assertDocument } from '../../../utils';
import Card from './Card';
import CardWrapper from './CardWrapper';

jest.mock('./Card', () => (props: any) => <span data-mock-card {...props} />);

jest.mock('./cardUtils', () => ({
  ...jest.requireActual('./cardUtils'),
  getHighlightTopOffset: jest.fn(() => 100),
}));

describe('CardWrapper', () => {
  const store = createTestStore();

  it('matches snapshot', () => {
    const component = renderer.create(<CardWrapper
      highlights={[createMockHighlight('id1')]}
      store={store}
    />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matchnes snapshot when there is no highlights', () => {
    const component = renderer.create(<CardWrapper
      highlights={[]}
      store={store}
    />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders cards', () => {
    const component = renderer.create(<CardWrapper
      highlights={[createMockHighlight(), createMockHighlight()]}
      store={store}
    />);

    expect(component.root.findAllByType(Card).length).toBe(2);
  });

  it('scrolls to card when focused', () => {
    const scrollIntoView = jest.spyOn(domUtils, 'scrollIntoView');
    scrollIntoView.mockImplementation(() => null);

    const highlight = {
      ...createMockHighlight(),
      elements: ['something'],
    };

    const component = renderer.create(<CardWrapper
      highlights={[highlight]}
      store={store}
    />);

    // Wait for React.useEffect
    renderer.act(() => undefined);

    const card = component.root.findByType(Card);
    card.props.onFocus();

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

    const component = renderer.create(<CardWrapper
      highlights={[highlight]}
      store={store}
    />);

    // Wait for React.useEffect
    renderer.act(() => undefined);

    const card = component.root.findByType(Card);
    card.props.onFocus();

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

    const component = renderer.create(<CardWrapper
      highlights={[highlight(), highlight(), highlight()]}
      store={store}
    />, {createNodeMock});

    // Wait for React.useEffect
    renderer.act(() => undefined);

    expect(div.style.top).toEqual('');

    // Update positions - currently all cards are in the same position
    // after onHeightChange their positions will be recalculated
    renderer.act(() => {
      component.root.findAllByType(Card)
        .forEach((card) => card.props.onHeightChange({ current: { offsetHeight: 100 }}));
    });

    // Position of last card is now 340px - all highlights are positioned 100px from the top
    // Which mean that position of first card is at 100px offsetTop. Since all cards have 100px height
    // and there is 20px margin between cards, we end up we having 340px offsetTop for third card.
    renderer.act(() => {
      const [, , card] = component.root.findAllByType(Card);
      expect(card.props.topOffset).toEqual(340);
      card.props.onFocus();
    });

    // When we focus third card then main wrapper should move to the top for 340px - 100px
    // which is equal to third card position - topOffset for this highlight.

    expect(div.style.top).toEqual('-240px');
  });

  it('coverage for onHeightChange', () => {
    const component = renderer.create(<CardWrapper
      highlights={[createMockHighlight()]}
      store={store}
    />);

    const card = component.root.findByType(Card);
    // Update state with a height
    renderer.act(() => {
      card.props.onHeightChange({ current: { offsetHeight: 100 }});
    });

    // Noops with height is the same
    renderer.act(() => {
      card.props.onHeightChange({ current: { offsetHeight: 100 }});
    });

    // Handle null value
    renderer.act(() => {
      card.props.onHeightChange({ current: { offsetHeight: null }});
    });

    expect(() => component.root.findAllByType(Card)).not.toThrow();
  });

  it('coverage for resetTopOffset', () => {
    const createNodeMock = () => ({
      style: { top: 0 },
    });

    const component = renderer.create(<CardWrapper
      highlights={[createMockHighlight()]}
      store={store}
    />, {createNodeMock});

    const card = component.root.findByType(Card);
    renderer.act(() => {
      card.props.resetTopOffset();
    });

    expect(() => component.root.findAllByType(Card)).not.toThrow();
  });
});
