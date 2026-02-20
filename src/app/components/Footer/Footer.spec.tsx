import React from 'react';
import renderer from 'react-test-renderer';
import * as redux from 'react-redux';
import Footer, { ContactDialog, useContactDialog } from '.';
import TestContainer from '../../../test/TestContainer';
import createTestStore from '../../../test/createTestStore';
import { openKeyboardShortcutsMenu } from '../../content/keyboardShortcuts/actions';
import { AppState, Store } from '../../types';
import { assertWindow } from '../../utils';
import * as analytics from '../../../helpers/analytics';
import * as focusManager from '../../content/utils/focusManager';

jest.mock('../../content/utils/focusManager');

describe('Footer', () => {
  it('uses normal footer', () => {
    const state = {} as unknown as AppState;
    const store = createTestStore(state);
    const component = renderer.create(<TestContainer store={store}>
      <Footer />
    </TestContainer>);
    expect(() => component.root.findByProps({ 'data-testid': 'portal-footer' })).toThrow();
  });

  it('uses portal footer', () => {
    const portalName = 'portalName';
    const params = { portalName };
    const state = {
      navigation: {
        match: { params },
      },
    } as unknown as AppState;
    const store = createTestStore(state);
    const component = renderer.create(<TestContainer store={store}>
      <Footer />
    </TestContainer>);
    expect(() => component.root.findByProps({ 'data-testid': 'portal-footer' })).not.toThrow();
  });

  it('calls captureOpeningElement when "Contact Us" is clicked in portal footer', () => {
    const portalName = 'portalName';
    const params = { portalName };
    const state = {
      navigation: {
        match: { params },
      },
    } as unknown as AppState;
    const store = createTestStore(state);
    const component = renderer.create(<TestContainer store={store}>
      <Footer />
    </TestContainer>);

    const contactUsButton = component.root.findAllByType(require('./styled').FooterButton)
      .find(button => button.props.children.props.id === 'i18n:footer:column1:contact-us')!;

    renderer.act(() => {
      contactUsButton.props.onClick();
    });

    expect(focusManager.captureOpeningElement).toHaveBeenCalledWith('contactdialog');
  });

});

describe('useContactDialog', () => {
  const windowBack = assertWindow();
  let store: Store;
  let addEventListener: jest.SpyInstance;

  beforeEach(() => {
    jest.restoreAllMocks();
    store = createTestStore();

    addEventListener = jest.spyOn(windowBack, 'addEventListener');
  });

  const ShowContactDialog = (props: Pick<Parameters<typeof ContactDialog>[0], 'contactFormParams'>) => {
    const { isOpen, close, open } = useContactDialog();

    return (
      <>
        <button onClick={open}>
          Contact Us
        </button>
        <ContactDialog {...props} isOpen={isOpen} close={close} />
      </>
    );
  };

  const testComponent = (storeOverride: Store, props?: Parameters<typeof ShowContactDialog>[0]) => {
    const component = renderer.create(
      <TestContainer store={storeOverride}>
        <ShowContactDialog {...props} />
      </TestContainer>
    );

    const controller = {
      get iframe() {
        return component.root.findByType('iframe');
      },
      get button() {
        return component.root.findByType('button');
      },
      get window() {
        return assertWindow();
      },
    };

    return { component, controller };
  };

  it('supports form params', () => {
    const contactFormParams = [{ key: 'userId', value: 'test' }];

    const { controller, component } = testComponent(store, { contactFormParams });

    renderer.act(() => {
      controller.button.props.onClick();
    });
    expect(controller.iframe.props.src.endsWith('body=userId%3Dtest')).toBe(true);
    component.unmount();
  });

  it('opens and closes', () => {
    const { controller, component } = testComponent(store);
    expect(() => controller.iframe).toThrow();
    renderer.act(() => {
      controller.button.props.onClick();
    });

    const messageHandlers = addEventListener.mock.calls.filter(([event]) => (
      event === 'message'
    ));

    renderer.act(() => {
      messageHandlers.forEach(([, handler]) => {
        // Should do nothing
        handler({
          data: 'Some Other Message',
          origin: controller.window.location.origin,
        });
      });
    });

    // Should still be open
    expect(() => controller.iframe).not.toThrow();

    renderer.act(() => {
      messageHandlers.forEach(([, handler]) => {
        // Should close the dialog
        handler({
          data: 'CONTACT_FORM_SUBMITTED',
          origin: controller.window.location.origin,
        });
      });
    });

    // Should be closed
    expect(() => controller.iframe).toThrow();
    component.unmount();
  });
});

describe('OpenKeyboardShortcutsLink', () => {

  it('opens the Keyboard Shortcuts Menu when that link is clicked', () => {
    const dispatch = jest.fn();
    const spyRedux = jest.spyOn(redux, 'useDispatch').mockImplementation(() => dispatch);

    const trackOpenCloseKS = jest.fn();
    const spyAnalytics = jest.spyOn(analytics, 'useAnalyticsEvent').mockImplementation(
      () => trackOpenCloseKS
    );

    const { root } = renderer.create(<TestContainer>
      <Footer />
    </TestContainer>);

    expect(spyRedux).toHaveBeenCalledTimes(1);

    expect(spyAnalytics).toHaveBeenCalledTimes(1);
    expect(spyAnalytics).toHaveBeenCalledWith('openCloseKeyboardShortcuts');

    const shortCutLink = root.findByProps({ 'data-testid': 'shortcut-link' });
    shortCutLink.props.onClick({ preventDefault: jest.fn() });

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(openKeyboardShortcutsMenu());

    expect(trackOpenCloseKS).toHaveBeenCalledTimes(1);
  });
});
