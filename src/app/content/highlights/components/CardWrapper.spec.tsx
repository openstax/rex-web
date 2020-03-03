import React from 'react';
import renderer from 'react-test-renderer';
import createMockHighlight from '../../../../test/mocks/highlight';
import Card from './Card';
import CardWrapper from './CardWrapper';

jest.mock('./Card', () => () => null);
jest.mock('./cardUtils', () => ({
  getHighlightTopOffset: () => 0,
}));

describe('CardWrapper', () => {
  it('matches snapshot', async() => {
    const component = renderer.create(<CardWrapper
      highlights={[createMockHighlight()]}
    />);

    // wait for React.useEffect
    await renderer.act(async() => undefined);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders cards', async() => {
    const component = renderer.create(<CardWrapper
      highlights={[createMockHighlight(), createMockHighlight()]}
    />);

    // wait for React.useEffect
    await renderer.act(async() => undefined);

    expect(component.root.findAllByType(Card).length).toBe(2);
  });
});
