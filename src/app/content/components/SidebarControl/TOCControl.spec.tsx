import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import createTestStore from '../../../../test/createTestStore';
import MessageProvider from '../../../../test/MessageProvider';
import { Store } from '../../../types';
import { lockTocControlState, withMobileResponsiveTocControl, TOCControl } from './TOCControl';
import { closeToc, openToc } from '../../actions';
import * as selectors from '../../selectors';

describe('TOCControl', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('lockTocControlState', () => {
    it('calls close function when isOpenLocked is true and button is clicked', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const LockedControl = lockTocControlState(true, TOCControl);

      const component = renderer.create(
        <Provider store={store}>
          <MessageProvider>
            <LockedControl />
          </MessageProvider>
        </Provider>
      );

      const button = component.root.findByProps({ 'data-testid': 'toc-button' });

      renderer.act(() => {
        button.props.onClick();
      });

      expect(dispatchSpy).toHaveBeenCalledWith(closeToc());
    });

    it('calls open function when isOpenLocked is false and button is clicked', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const LockedControl = lockTocControlState(false, TOCControl);

      const component = renderer.create(
        <Provider store={store}>
          <MessageProvider>
            <LockedControl />
          </MessageProvider>
        </Provider>
      );

      const button = component.root.findByProps({ 'data-testid': 'toc-button' });

      renderer.act(() => {
        button.props.onClick();
      });

      expect(dispatchSpy).toHaveBeenCalledWith(openToc());
    });
  });

  describe('withMobileResponsiveTocControl', () => {
    it('sets isActive to undefined when showActivatedState is false', () => {
      jest.spyOn(selectors, 'tocOpen').mockReturnValue(true);
      const ResponsiveControl = withMobileResponsiveTocControl(TOCControl);

      const component = renderer.create(
        <Provider store={store}>
          <MessageProvider>
            <ResponsiveControl showActivatedState={false} />
          </MessageProvider>
        </Provider>
      );

      const button = component.root.findByProps({ 'data-testid': 'toc-button' });

      expect(button.props.isActive).toBeUndefined();
    });

    it('sets isActive based on isOpen when showActivatedState is true', () => {
      jest.spyOn(selectors, 'tocOpen').mockReturnValue(true);
      const ResponsiveControl = withMobileResponsiveTocControl(TOCControl);

      const component = renderer.create(
        <Provider store={store}>
          <MessageProvider>
            <ResponsiveControl showActivatedState={true} />
          </MessageProvider>
        </Provider>
      );

      const button = component.root.findByProps({ 'data-testid': 'toc-button' });

      expect(button.props.isActive).toBe(true);
    });

    it('sets isActive to false when showActivatedState is true but TOC is closed', () => {
      jest.spyOn(selectors, 'tocOpen').mockReturnValue(false);
      const ResponsiveControl = withMobileResponsiveTocControl(TOCControl);

      const component = renderer.create(
        <Provider store={store}>
          <MessageProvider>
            <ResponsiveControl showActivatedState={true} />
          </MessageProvider>
        </Provider>
      );

      const button = component.root.findByProps({ 'data-testid': 'toc-button' });

      expect(button.props.isActive).toBe(false);
    });
  });
});
