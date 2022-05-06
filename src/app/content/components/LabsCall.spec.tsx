import React from 'react';
import renderer from 'react-test-renderer';
import TestContainer from '../../../test/TestContainer';
import * as selectors from '../../featureFlags/selectors';
import LabsCTA from './LabsCall';

describe('LabsCTA', () => {
  let flagSelectorSpy: jest.SpyInstance;

  beforeEach(() => {
    flagSelectorSpy = jest.spyOn(selectors, 'kineticBannerEnabled');
  });

  const render = () => <TestContainer>
    <LabsCTA />
  </TestContainer>;

  it('renders `null` when selector is false', () => {
    flagSelectorSpy.mockReturnValue(false);
    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders cta when selector is true', () => {
    flagSelectorSpy.mockReturnValue(true);
    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
