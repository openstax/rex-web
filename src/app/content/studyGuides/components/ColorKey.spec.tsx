import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import ColorKey, { ColorKeyButtonWrapper } from './ColorKey';

describe('Study Guides button and PopUp', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
    services = createTestServices();
    store = createTestStore();
  });

  it('matches snapshot', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <ColorKey />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    renderer.act(() => {
      const button = component.root.findByType(ColorKeyButtonWrapper);
      button.props.onClick();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Tracks open close to GA', async() => {
    const spyTrack = jest.spyOn(services.analytics.openCloseColorKey, 'track');

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <ColorKey />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    /*open and close sccolor key*/

    const button = component.root.findByType(ColorKeyButtonWrapper);
    renderer.act(() => {
      button.props.onClick();
      expect(spyTrack).toHaveBeenCalledWith({pathname: '/'}, false);
    });

    renderer.act(() => {
      spyTrack.mockClear();
      button.props.onClick();
      expect(spyTrack).toHaveBeenCalledWith({pathname: '/'}, true);
    });

  });
});
