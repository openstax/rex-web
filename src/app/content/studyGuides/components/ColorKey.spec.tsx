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

  it('Opens and closes from click outside or button', () => {
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

    /* open and close from clicking button*/
    renderer.act(() => button.props.onClick());
    expect(() => component.root.findByType(ColorKeyDescription)).not.toThrow();
    renderer.act(() => button.props.onClick());
    expect(() => component.root.findByType(ColorKeyDescription)).toThrow();

    /*close from clicking outside*/
    renderer.act(() => button.props.onClick());
    expect(() => component.root.findByType(ColorKeyDescription)).not.toThrow();
    renderer.act(() => clickOutside());
    expect(() => component.root.findByType(ColorKeyDescription)).toThrow();
  });
});
