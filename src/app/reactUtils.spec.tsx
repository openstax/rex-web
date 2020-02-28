import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
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
