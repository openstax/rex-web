import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import createMockHighlight from '../../../../test/mocks/highlight';
import * as domUtils from '../../../domUtils';
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
  });
});
