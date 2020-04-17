import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import renderer from 'react-test-renderer';
import { resetModules } from '../test/utils';
import * as utils from './reactUtils';
import { assertDocument, assertWindow } from './utils';

describe('useFocusLost', () => {
  let ref: React.RefObject<HTMLElement>;
  let htmlElement: HTMLElement;
  let childElement: HTMLElement;
  let siblingElement: HTMLElement;
  let addEventListener: jest.SpyInstance;
  let removeEventListener: jest.SpyInstance;

  beforeEach(() => {
    htmlElement = assertDocument().createElement('div');
    childElement = assertDocument().createElement('div');
    htmlElement.appendChild(childElement);
    siblingElement = assertDocument().createElement('div');
    ref = {
      current: htmlElement,
    } as React.RefObject<HTMLElement>;
    addEventListener = jest.spyOn(ref.current!, 'addEventListener');
    removeEventListener = jest.spyOn(ref.current!, 'removeEventListener');
  });

  it('registers event listener', () => {
    utils.onFocusLostHandler(ref, true, () => null)();
    expect(addEventListener).toHaveBeenCalled();
  });

  it('doesn\'t register event listener when ref.current doesn\'t exist', () => {
    utils.onFocusLostHandler({ current: null }, true, () => null)();
    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('doesn\'t register event listener when os disabled', () => {
    utils.onFocusLostHandler({ current: null }, false, () => null)();
    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('removes event listener', () => {
    const removeEvListener = utils.onFocusLostHandler(ref, true, () => null)();
    expect(removeEvListener).toBeDefined();
    removeEvListener!();
    expect(removeEventListener).toHaveBeenCalled();
  });

  it('moving focusout event trigger callback', () => {
    const window = assertWindow();
    const cb = jest.fn();
    utils.onFocusLostHandler(ref, true, cb)();

    const focusOutEvent = window.document.createEvent('FocusEvent');
    Object.defineProperty(focusOutEvent, 'relatedTarget', {
      value: siblingElement,
      writable: false,
    });
    focusOutEvent.initEvent('focusout', true, false);

    ref.current!.dispatchEvent(focusOutEvent);

    expect(cb).toHaveBeenCalled();
  });

  it('noops when clicking on child item', () => {
    const window = assertWindow();
    const cb = jest.fn();
    utils.onFocusLostHandler(ref, true, cb)();

    const focusOutEvent = window.document.createEvent('FocusEvent');
    Object.defineProperty(focusOutEvent, 'relatedTarget', {
      value: childElement,
      writable: false,
    });
    focusOutEvent.initEvent('focusout', true, false);

    childElement.dispatchEvent(focusOutEvent);

    expect(cb).not.toHaveBeenCalled();
  });
});

describe('useTimeout', () => {
  // tslint:disable-next-line:variable-name
  let Component: React.ComponentType;
  let callback: jest.Mock;
  beforeEach(() => {
    resetModules();
    jest.useFakeTimers();

    callback = jest.fn();

    Component = () => {
      const [delay, setDelay] = React.useState(1000);
      utils.useTimeout(delay, callback);

      return <button onClick={() => setDelay(2000)}></button>;
    };
  });

  it('resets after delay changes' , () => {
    const {root} = renderer.create(<Component />);

    expect(callback).not.toHaveBeenCalled();

    const button = root.findByType('button');

    renderer.act(() => {
      button.props.onClick();
      jest.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();

    renderer.act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalled();
  });
});

describe('useOnDOMEvent', () => {
  let addEventListener: jest.SpyInstance;
  let removeEventListener: jest.SpyInstance;
  const cb = () => undefined;
  beforeEach(() => {
    resetModules();
  });

  describe('on html element' , () => {
    let ref: React.RefObject<HTMLElement>;
    let htmlElement: HTMLElement;

    beforeEach(() => {
      htmlElement = assertDocument().createElement('div');
      ref = {
        current: htmlElement,
      } as React.RefObject<HTMLElement>;

      addEventListener = jest.spyOn(ref.current!, 'addEventListener');
      removeEventListener = jest.spyOn(ref.current!, 'removeEventListener');
    });

    it('doesn\'t do anything without a target', () => {
      const cleanup = utils.onDOMEventHandler({current: null}, true, 'click', cb)();
      expect(cleanup).not.toBeDefined();
    });

    it('registers event listenr' , () => {
      utils.onDOMEventHandler(ref, true, 'click', cb)();
      expect(addEventListener).toHaveBeenCalledWith('click', cb);
    });

    it('removes event listener', () => {
      const cleanup = utils.onDOMEventHandler(ref, true, 'click', cb)();

      expect(cleanup).toBeDefined();
      cleanup!();
      expect(removeEventListener).toHaveBeenCalledWith('click', cb);
    });

    it('doesn\'t register event handler if is disabled', () => {
      const cleanup = utils.onDOMEventHandler(ref, false, 'click', cb)();

      expect(addEventListener).not.toHaveBeenCalled();
      expect(cleanup).toBeDefined();
    });
  });

  describe('on window' , () => {
    let window: Window;

    beforeEach(() => {
      window = assertWindow();

      addEventListener = jest.spyOn(window, 'addEventListener');
      removeEventListener = jest.spyOn(window, 'removeEventListener');
    });

    it('follows the normal flow', () => {
      const cleanup = utils.onDOMEventHandler(window, true, 'click', cb)();

      expect(cleanup).toBeDefined();
      expect(addEventListener).toHaveBeenCalledWith('click', cb);

      cleanup!();
      expect(removeEventListener).toBeDefined();
    });
  });
});

describe('onEscHandler', () => {
  let ref: React.RefObject<HTMLElement>;
  let htmlElement: HTMLElement;
  let addEventListener: jest.SpyInstance;
  let removeEventListener: jest.SpyInstance;

  beforeEach(() => {
    htmlElement = assertDocument().createElement('div');
    ref = {
      current: htmlElement,
    } as React.RefObject<HTMLElement>;
    addEventListener = jest.spyOn(ref.current!, 'addEventListener');
    removeEventListener = jest.spyOn(ref.current!, 'removeEventListener');
  });

  it('registers event listener', () => {
    utils.onEscHandler(ref, true, () => null)();
    expect(addEventListener).toHaveBeenCalled();
  });

  it('doesn\'t register event listener when ref.current doesn\'t exist', () => {
    utils.onEscHandler({ current: null }, true, () => null)();
    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('removes event listener', () => {
    const removeEvListener = utils.onEscHandler(ref, true, () => null)();
    expect(removeEvListener).toBeDefined();
    removeEvListener!();
    expect(removeEventListener).toHaveBeenCalled();
  });

  it('clicking Escape invokes callback', () => {
    const window = assertWindow();
    const cb = jest.fn();
    utils.onEscHandler(ref, true, cb)();

    const keyboardEvent = window.document.createEvent('KeyboardEvent');
    keyboardEvent.initKeyboardEvent('keydown', true, true, window, 'Escape', 0, '', false, '');

    ref.current!.dispatchEvent(keyboardEvent);

    expect(cb).toHaveBeenCalled();
  });

  it('clicking other button doesn\'t invokes callback', () => {
    const window = assertWindow();
    const cb = jest.fn();
    utils.onEscHandler(ref, true, cb)();

    const keyboardEvent = window.document.createEvent('KeyboardEvent');
    keyboardEvent.initKeyboardEvent('keydown', true, true, window, 'Other key', 0, '', false, '');

    ref.current!.dispatchEvent(keyboardEvent);

    expect(cb).not.toHaveBeenCalled();
  });
});
