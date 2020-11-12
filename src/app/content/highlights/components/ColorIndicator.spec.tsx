import React from 'react';
import renderer from 'react-test-renderer';
import { highlightStyles } from '../../constants';
import ColorIndicator from './ColorIndicator';

describe('ColorIndicator', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<ColorIndicator style={highlightStyles[0]} />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('matches snapshot (checked)', () => {
    const component = renderer.create(<ColorIndicator checked style={highlightStyles[0]} />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
