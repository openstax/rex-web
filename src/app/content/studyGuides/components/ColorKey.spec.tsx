import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import * as onClickOutside from '../../highlights/components/utils/onClickOutside';
import ColorKey, { ColorKeyButtonWrapper } from './ColorKey';
import Filters from './Filters';

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

  it('Tracks open close to GA', () => {
    const spyTrack = jest.spyOn(services.analytics.openCloseColorKey, 'track');
    const spyClickOutside = jest.spyOn(onClickOutside, 'useOnClickOutside');

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Filters />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    /*open and close color key*/
    const button = component.root.findByType(ColorKeyButtonWrapper);
    renderer.act(() => {
      button.props.onClick();
    });
    expect(spyTrack).toHaveBeenCalledWith({pathname: '/'}, true);

    renderer.act(() => {
      ReactTestUtils.Simulate.click(component);
      button.props.onClick();
    });
    /*mock close call to GA*/
    services.analytics.openCloseColorKey.track({pathname: '/'}, false);
    expect(spyClickOutside).toHaveBeenCalledWith({current: null}, true, expect.any(Function));
  });
});
