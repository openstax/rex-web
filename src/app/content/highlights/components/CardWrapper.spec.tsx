import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import createMockHighlight from '../../../../test/mocks/highlight';
import Card from './Card';
import CardWrapper from './CardWrapper';

jest.mock('./Card', () => () => <span data-mock-card />);

jest.mock('./cardUtils', () => ({
  ...jest.requireActual('./cardUtils'),
  getHighlightTopOffset: jest.fn(() => 100),
}));

describe('CardWrapper', () => {
  const store = createTestStore();

  it('matches snapshot', async() => {
    const component = renderer.create(<CardWrapper
      highlights={[createMockHighlight()]}
      store={store}
    />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders cards', async() => {
    const component = renderer.create(<CardWrapper
      highlights={[createMockHighlight(), createMockHighlight()]}
      store={store}
    />);

    expect(component.root.findAllByType(Card).length).toBe(2);
  });
});
