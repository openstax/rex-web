import React from 'react';
import renderer from 'react-test-renderer';
import Footer, { ContactDialog, useContactDialog } from '.';
import TestContainer from '../../../test/TestContainer';
import createTestStore from '../../../test/createTestStore';
import { AppState, Store } from '../../types';
import { assertWindow } from '../../utils';

describe('Footer', () => {
  it('uses normal footer', () => {
    const state = {} as unknown as AppState;
    const store = createTestStore(state);
    const component = renderer.create(<TestContainer store={store}>
      <Footer />
    </TestContainer>);
    expect(() => component.root.findByProps({'data-testid': 'portal-footer'})).toThrow();
  });

  it('uses portal footer', () => {
    const portalName = 'portalName';
    const params = {portalName};
    const state = {
      navigation: {
        match: {params},
      },
    } as unknown as AppState;
    const store = createTestStore(state);
    const component = renderer.create(<TestContainer store={store}>
      <Footer />
    </TestContainer>);
    expect(() => component.root.findByProps({'data-testid': 'portal-footer'})).not.toThrow();
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

  // tslint:disable-next-line:variable-name
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

    return {component, controller};
  };

  it('supports form params', () => {
    const contactFormParams = [{ key: 'userId', value: 'test' }];

    const {controller, component} = testComponent(store, {contactFormParams});

    renderer.act(() => {
      controller.button.props.onClick();
    });
    expect(controller.iframe.props.src.endsWith('body=userId%3Dtest')).toBe(true);
    component.unmount();
  });

  it('opens and closes', () => {
    const {controller, component} = testComponent(store);
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
