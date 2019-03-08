import React from 'react';
import renderer from 'react-test-renderer';
import Routes from './Routes';

describe('Routes', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<Routes />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
