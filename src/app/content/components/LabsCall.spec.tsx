import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import TestContainer from '../../../test/TestContainer';
import * as selectors from '../../featureFlags/selectors';
import { AppState } from '../../types';
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

  it('links to kinetic in the current portal', () => {
    flagSelectorSpy.mockReturnValue(true);
    const store = createTestStore({
      navigation: { match: { params: { portalName: 'my-portal' } } },
    } as unknown as AppState);
    const component = renderer.create(<TestContainer store={store}>
      <LabsCTA />
    </TestContainer>);

    expect(component.root.findByType('a').props.href).toBe('/my-portal/kinetic/');
  });

  it('renders cta when selector is true', () => {
    flagSelectorSpy.mockReturnValue(true);
    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
