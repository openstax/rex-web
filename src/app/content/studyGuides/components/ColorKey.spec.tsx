import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { assertDocument } from '../../../utils';
import ColorKey, { ColorKeyButtonWrapper, ColorKeyDescription } from './ColorKey';
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

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Filters />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    /*open and close color key from button*/
    const button = component.root.findByType(ColorKeyButtonWrapper);
    renderer.act(() => {
      button.props.onClick();
    });
    expect(spyTrack).toHaveBeenCalledWith({pathname: '/'}, true);

    renderer.act(() => {
      button.props.onClick(); /* closing from Color key button*/
    });

    /*mock close call to GA*/
    services.analytics.openCloseColorKey.track({pathname: '/'}, false);
    expect(() => component.root.findByType(ColorKeyDescription)).toThrow();
  });

  it('Closes from click outside', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Filters />
        </MessageProvider>
      </Services.Provider>
    </Provider>, {createNodeMock: () => assertDocument().createElement('div')});

    const clickOutside = () => {
      const document = assertDocument();
      const elementOutside = document.createElement('div');
      document.body.appendChild(elementOutside);
      const event = document.createEvent('MouseEvent');
      event.initEvent('click', true, false);
      elementOutside.dispatchEvent(event);
      elementOutside.remove();
    };

    const button = component.root.findByType(ColorKeyButtonWrapper);
    renderer.act(() => button.props.onClick());

    expect(() => component.root.findByType(ColorKeyDescription)).not.toThrow();

    renderer.act(() => clickOutside());
    expect(() => component.root.findByType(ColorKeyDescription)).toThrow();
  });
});
