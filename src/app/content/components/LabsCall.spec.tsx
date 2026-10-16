import React from 'react';
import renderer from 'react-test-renderer';
import { isK12Portal, resetK12PortalCache } from '../../../helpers/analytics/k12Portal';
import createTestStore from '../../../test/createTestStore';
import TestContainer from '../../../test/TestContainer';
import * as selectors from '../../featureFlags/selectors';
import { locationChange } from '../../navigation/actions';
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

  describe('on a portal route', () => {
    const portalStore = () => {
      const store = createTestStore();
      store.dispatch(locationChange({
        action: 'PUSH',
        location: {} as any,
        match: {params: {portalName: 'some-school'}} as any,
      }));
      return store;
    };

    beforeEach(() => {
      resetK12PortalCache();
      flagSelectorSpy.mockReturnValue(true);
    });

    it('renders `null` on a K12 portal', async() => {
      await isK12Portal({getSchoolDataFromPortalName: () => Promise.resolve({industry: 'K12'} as any)}, 'some-school');
      const component = renderer.create(<TestContainer store={portalStore()}><LabsCTA /></TestContainer>);
      expect(component.toJSON()).toBeNull();
    });

    it('renders cta on a portal not known to be K12', () => {
      const component = renderer.create(<TestContainer store={portalStore()}><LabsCTA /></TestContainer>);
      expect(component.toJSON()).not.toBeNull();
    });
  });

  it('renders cta when selector is true', () => {
    flagSelectorSpy.mockReturnValue(true);
    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
