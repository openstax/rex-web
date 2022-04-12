import React from 'react';
import renderer from 'react-test-renderer';
import TestContainer from '../../../test/TestContainer';
import LabsCTA from './LabsCall';

describe('LabsCTA', () => {

  const render = () => <TestContainer>
    <LabsCTA />
  </TestContainer>;

  it('renders cta', () => {
    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
