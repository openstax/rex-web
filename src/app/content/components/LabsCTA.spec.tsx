import React from 'react';
import renderer from 'react-test-renderer';
import TestContainer from '../../../test/TestContainer';
import * as selectors from '../../featureFlags/selectors';
import LabsCTA from './LabsCTA';

describe('PrevNextBar', () => {
  let variantSelectorSpy: jest.SpyInstance;

  beforeEach(() => {
    variantSelectorSpy = jest.spyOn(selectors, 'kineticBannerVariant');
  });

  const render = () => <TestContainer>
    <LabsCTA />
  </TestContainer>;

  it('renders `null` when selector is false', () => {
    variantSelectorSpy.mockReturnValue(false);
    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders first variant', () => {
    variantSelectorSpy.mockReturnValue(0);
    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders second variant', () => {
    variantSelectorSpy.mockReturnValue(1);
    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders third variant', () => {
    variantSelectorSpy.mockReturnValue(2);
    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
