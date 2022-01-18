import { noop } from 'lodash/fp';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import Toolbar from '.';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import MessageProvider from '../../../../test/MessageProvider';
import TestContainer from '../../../../test/TestContainer';
import * as Services from '../../../context/Services';
import { receiveFeatureFlags } from '../../../featureFlags/actions';
import { MiddlewareAPI, Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { closeMobileMenu } from '../../actions';
import { practiceQuestionsFeatureFlag } from '../../constants';
import * as selectors from '../../selectors';
import { CloseMobileMenuButton } from '../SidebarControl';

describe('toolbar', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices> & MiddlewareAPI;

  beforeEach(() => {
    store = createTestStore();
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };
  });

  it('resizes on scroll', () => {
    const sidebar = assertWindow().document.createElement('div');
    jest.spyOn(selectors, 'mobileMenuOpen').mockReturnValue(true);

    renderer.create(<TestContainer store={store}>
      <Toolbar />
    </TestContainer>, { createNodeMock: () => sidebar });

    const spy = jest.spyOn(sidebar.style, 'setProperty');

    const event = assertWindow().document.createEvent('UIEvents');
    event.initEvent('scroll', true, false);

    renderer.act(() => {
      assertWindow().dispatchEvent(event);
    });

    expect(spy).toHaveBeenCalledWith('height', expect.anything());
  });

  it('has a button that closes mobile menu', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const component = renderer.create(<TestContainer store={store}>
      <Toolbar />
    </TestContainer>);

    renderer.act(() => {
      component.root.findByType(CloseMobileMenuButton).props.onClick();
    });

    expect(dispatchSpy).toHaveBeenCalledWith(closeMobileMenu());
  });

  describe('print button', () => {
    let print: jest.SpyInstance;

    beforeEach(() => {
      print = jest.spyOn(assertWindow(), 'print');
      print.mockImplementation(noop);
    });

    it('prints', () => {
      const component = renderer.create(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Toolbar />
          </MessageProvider>
        </Services.Provider>
      </Provider>);

      const event = {
        preventDefault: jest.fn(),
      };

      component.root.findByProps({ 'data-testid': 'print' }).props.onClick(event);

      expect(print).toHaveBeenCalled();
    });

    it('does not render print button if practice questions fleature flag is enabled', () => {
      store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));

      const component = renderer.create(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Toolbar />
          </MessageProvider>
        </Services.Provider>
      </Provider>);

      expect(() => component.root.findByProps({ 'data-testid': 'print' })).toThrow();
    });
  });
});
