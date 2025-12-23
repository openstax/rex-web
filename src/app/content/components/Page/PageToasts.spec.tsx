import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import TestContainer from '../../../../test/TestContainer';
import { resetModules } from '../../../../test/utils';
import { addToast } from '../../../notifications/actions';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import Toast from '../../../notifications/components/ToastNotifications/Toast';
import { groupedToastNotifications } from '../../../notifications/selectors';
import { Store } from '../../../types';
import { openMobileToolbar } from '../../search/actions';
import ToastNotifications from './PageToasts';

describe('PageToasts', () => {
  let store: Store;

  beforeEach(async () => {
    jest.useFakeTimers();
    await resetModules();

    store = createTestStore();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('matches snapshot', () => {
    let component: renderer.ReactTestRenderer;
    renderer.act(() => {
      component = renderer.create(<TestContainer store={store}>
        <ToastNotifications />
      </TestContainer>);
      jest.runAllTimers();
    });

    const tree = component!.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshots with toasts', () => {
    store.dispatch(addToast(toastMessageKeys.highlights.failure.create, {destination: 'page'}));
    const toasts = groupedToastNotifications(store.getState()).page;

    if (!toasts) {
      return expect(toasts).toBeTruthy();
    }

    let component: renderer.ReactTestRenderer;
    renderer.act(() => {
      component = renderer.create(<TestContainer store={store}>
        <ToastNotifications />
      </TestContainer>);
      jest.runAllTimers();
    });

    expect(component!.root.findAllByType(Toast).length).toBe(1);

    const tree = component!.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with toasts when mobile toolbar is open', () => {
    store.dispatch(addToast(toastMessageKeys.highlights.failure.create, {destination: 'page'}));
    store.dispatch(openMobileToolbar());

    let component: renderer.ReactTestRenderer;
    renderer.act(() => {
      component = renderer.create(<TestContainer store={store}>
        <ToastNotifications />
      </TestContainer>);
      jest.runAllTimers();
    });

    const tree = component!.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
