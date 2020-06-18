import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { User } from '../../../auth/types';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import ColorKey, { ColorKeyButtonWrapper } from './ColorKey';

describe('Study Guides button and PopUp', () => {
  let dispatch: jest.SpyInstance;
  let store: Store;
  let user: User;
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
    services = createTestServices();
    store = createTestStore();
    user = {firstName: 'test', isNotGdprLocation: true, uuid: 'some_uuid'};

    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('shows color key and tracks open close to GA', async() => {
    const spyTrack = jest.spyOn(services.analytics.openCloseStudyGuides, 'track');

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <ColorKey />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    /*open color key*/
    renderer.act(() => {
      const button = component.root.findByType(ColorKeyButtonWrapper);
      button.props.onClick();
      expect(spyTrack).toHaveBeenCalled();
    });

    /*close color key*/
    renderer.act(() => {
      const button = component.root.findByType(ColorKeyButtonWrapper);
      button.props.onClick();
      expect(spyTrack).toHaveBeenCalled();
    });

  });
});
