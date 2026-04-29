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

    it('applies base className when no className prop is provided', () => {
      const component = renderer.create(
        <Provider store={store}>
          <MessageProvider>
            <CloseToCAndMobileMenuButton />
          </MessageProvider>
        </Provider>
      );

      const button = component.root.findByType('button');
      expect(button.props.className).toBe('sidebar-control-close-toc-mobile-button');
    });

    it('merges base className with consumer className when className prop is provided', () => {
      const component = renderer.create(
        <Provider store={store}>
          <MessageProvider>
            <CloseToCAndMobileMenuButton className="custom-mobile-class" />
          </MessageProvider>
        </Provider>
      );

      const button = component.root.findByType('button');
      expect(button.props.className).toBe('sidebar-control-close-toc-mobile-button custom-mobile-class');
    });
  });
});
