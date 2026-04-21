import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import createTestStore from '../../../../test/createTestStore';
import MessageProvider from '../../../../test/MessageProvider';
import { Store } from '../../../types';
import { CloseToCAndMobileMenuButton } from './index';
import { closeMobileMenu, resetToc } from '../../actions';

describe('SidebarControl/index', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('CloseToCAndMobileMenuButton', () => {
    it('dispatches closeMobileMenu and resetToc when clicked', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      const component = renderer.create(
        <Provider store={store}>
          <MessageProvider>
            <CloseToCAndMobileMenuButton />
          </MessageProvider>
        </Provider>
      );

      const button = component.root.findByType('button');

      renderer.act(() => {
        button.props.onClick();
      });

      expect(dispatchSpy).toHaveBeenCalledWith(closeMobileMenu());
      expect(dispatchSpy).toHaveBeenCalledWith(resetToc());
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });
  });
});
