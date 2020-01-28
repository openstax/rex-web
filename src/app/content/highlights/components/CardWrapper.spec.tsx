import React from 'react';
import renderer from 'react-test-renderer';
import createMockHighlight from '../../../../test/mocks/highlight';
import Card from './Card';
import CardWrapper from './CardWrapper';

jest.mock('./Card', () => () => null);

describe('CardWrapper', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<CardWrapper highlights={[]} />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders cards', () => {
    const component = renderer.create(<CardWrapper
      highlights={[createMockHighlight(), createMockHighlight()]}
    />);

    expect(component.root.findAllByType(Card).length).toBe(2);
  });
});
