import type { KeyboardEvent, MediaQueryList, HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import { resetModules, runHooks } from '../../test/utils';
import * as utils from '.';
import { assertDocument, assertWindow } from '../utils';
import { Highlight } from '@openstax/highlighter';
import { act } from 'react-dom/test-utils';

describe('onFocusInOrOutHandler focusout', () => {
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
    utils.onFocusInOrOutHandler(ref, true, () => null, 'focusout')();
    expect(addEventListener).toHaveBeenCalled();
  });

  it('doesn\'t register event listener when ref.current doesn\'t exist', () => {
    utils.onFocusInOrOutHandler({ current: null }, true, () => null, 'focusout')();
    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('doesn\'t register event listener when os disabled', () => {
    utils.onFocusInOrOutHandler({ current: null }, false, () => null, 'focusout')();
    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('removes event listener', () => {
    const removeEvListener = utils.onFocusInOrOutHandler(ref, true, () => null, 'focusout')();
    expect(removeEvListener).toBeDefined();
    removeEvListener!();
    expect(removeEventListener).toHaveBeenCalled();
  });

  it('moving focusout event trigger callback', () => {
    const testWindow = assertWindow();
    const cb = jest.fn();
    utils.onFocusInOrOutHandler(ref, true, cb, 'focusout')();

    const focusOutEvent = testWindow.document.createEvent('FocusEvent');
    Object.defineProperty(focusOutEvent, 'relatedTarget', {
      value: siblingElement,
      writable: false,
    });
    focusOutEvent.initEvent('focusout', true, false);

    ref.current!.dispatchEvent(focusOutEvent);

    expect(cb).toHaveBeenCalled();
  });

  it('noops when clicking on child item', () => {
    const testWindow = assertWindow();
    const cb = jest.fn();
    utils.onFocusInOrOutHandler(ref, true, cb, 'focusout')();

    const focusOutEvent = testWindow.document.createEvent('FocusEvent');
    Object.defineProperty(focusOutEvent, 'relatedTarget', {
      value: childElement,
      writable: false,
    });
    focusOutEvent.initEvent('focusout', true, false);

    childElement.dispatchEvent(focusOutEvent);

    expect(cb).not.toHaveBeenCalled();
  });
  it('noops when relatedTarget is null', () => {
    const testWindow = assertWindow();
    const cb = jest.fn();
    utils.onFocusInOrOutHandler(ref, true, cb, 'focusout')();

    const focusOutEvent = testWindow.document.createEvent('FocusEvent');
    // no relatedTarget
    focusOutEvent.initEvent('focusout', true, false);

    childElement.dispatchEvent(focusOutEvent);

    expect(cb).not.toHaveBeenCalled();
  });
});

describe('onFocusInOrOutHandler focusin', () => {
  let ref: React.RefObject<HTMLElement>;
  let htmlElement: HTMLElement;
  let childElement: HTMLElement;
  let siblingElement: HTMLElement;

  beforeEach(() => {
    htmlElement = assertDocument().createElement('div');
    childElement = assertDocument().createElement('div');
    htmlElement.appendChild(childElement);
    siblingElement = assertDocument().createElement('div');
    ref = {
      current: htmlElement,
    } as React.RefObject<HTMLElement>;
  });

  it('clicking on child element triggers callback', () => {
    const testWindow = assertWindow();
    const cb = jest.fn();
    utils.onFocusInOrOutHandler(ref, true, cb, 'focusin')();

    const focusinEvent = testWindow.document.createEvent('FocusEvent');
    Object.defineProperty(focusinEvent, 'target', {
      value: childElement,
      writable: false,
    });
    focusinEvent.initEvent('focusin', true, false);

    ref.current!.dispatchEvent(focusinEvent);

    expect(cb).toHaveBeenCalled();
  });

  it('noops when clicking on sibling item', () => {
    const testWindow = assertWindow();
    const cb = jest.fn();
    utils.onFocusInOrOutHandler(ref, true, cb, 'focusin')();

    const focusinEvent = testWindow.document.createEvent('FocusEvent');
    Object.defineProperty(focusinEvent, 'target', {
      value: siblingElement,
      writable: false,
    });
    focusinEvent.initEvent('focusin', true, false);

    siblingElement.dispatchEvent(focusinEvent);

    expect(cb).not.toHaveBeenCalled();
  });
});

describe('useTimeout', () => {
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

  it('resets after delay changes', () => {
    const { root } = renderer.create(<Component />);

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

  describe('on html element', () => {
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
      const cleanup = utils.onDOMEventHandler({ current: null }, true, 'click', cb)();
      expect(cleanup).not.toBeDefined();
    });

    it('registers event listenr', () => {
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

  describe('on window', () => {
    let testWindow: Window;

    beforeEach(() => {
      testWindow = assertWindow();

      addEventListener = jest.spyOn(testWindow, 'addEventListener');
      removeEventListener = jest.spyOn(testWindow, 'removeEventListener');
    });

    it('follows the normal flow', () => {
      const cleanup = utils.onDOMEventHandler(testWindow, true, 'click', cb)();

      expect(cleanup).toBeDefined();
      expect(addEventListener).toHaveBeenCalledWith('click', cb);

      cleanup!();
      expect(removeEventListener).toBeDefined();
    });
  });
});

describe('useTrapTabNavigation', () => {
  let originalActiveElementDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    // Capture the original activeElement descriptor to restore it later
    originalActiveElementDescriptor = Object.getOwnPropertyDescriptor(document, 'activeElement');
  });

  afterEach(() => {
    // Restore the original activeElement descriptor or remove test overrides
    if (originalActiveElementDescriptor) {
      Object.defineProperty(document, 'activeElement', originalActiveElementDescriptor);
    } else {
      // If there was no own-property descriptor originally, remove any override created during the test
      delete (document as any).activeElement;
    }
  });

  it('short circuits if no ref element', () => {
    const Component = () => {
      const ref = React.useRef<HTMLElement | null>(null);
      utils.useTrapTabNavigation(ref);
      return <div />;
    };

    const createComponent = () => {
      const component = renderer.create(<Component />);
      runHooks(renderer);
      renderer.act(() => {
        component.unmount();
      });
    };
    expect(createComponent).not.toThrow();
  });

  it('attaches listeners to container element', () => {
    const container = assertDocument().createElement('div');
    const b = assertDocument().createElement('button');
    container.appendChild(b);
    const addEventListenerSpy = jest.spyOn(container, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(container, 'removeEventListener');

    const Component = () => {
      const ref = React.useRef<HTMLElement | null>(container);
      utils.useTrapTabNavigation(ref);
      return <div />;
    };

    const tr = renderer.create(<Component />);
    runHooks(renderer);

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), true);

    renderer.act(() => {
      tr.unmount();
    });

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), true);

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
  it('auto-focuses first focusable element on mount', () => {
    const container = assertDocument().createElement('div');
    const btn1 = assertDocument().createElement('button');
    const btn2 = assertDocument().createElement('button');
    const focusSpy = jest.spyOn(btn1, 'focus');

    Object.defineProperty(btn1, 'offsetHeight', {
      value: 1000,
      writable: false,
    });
    Object.defineProperty(btn2, 'offsetHeight', {
      value: 1000,
      writable: false,
    });

    container.appendChild(btn1);
    container.appendChild(btn2);

    // Mock activeElement to return body (no focus yet)
    const docBody = assertDocument().body;
    Object.defineProperty(document, 'activeElement', {
      value: docBody,
      writable: false,
      configurable: true,
    });

    const Component = () => {
      const ref = React.useRef<HTMLElement | null>(container);
      utils.useTrapTabNavigation(ref, undefined, true);
      return <div />;
    };

    renderer.act(() => {
      renderer.create(<Component />);
    });

    expect(focusSpy).toHaveBeenCalled();

    focusSpy.mockRestore();
  });
  it('preserves selection when auto-focusing on mount', () => {
    const container = assertDocument().createElement('div');
    const btn = assertDocument().createElement('button');

    Object.defineProperty(btn, 'offsetHeight', {
      value: 1000,
      writable: false,
    });

    container.appendChild(btn);

    const mockRange = {
      cloneRange: jest.fn(function(this: any) {
        return this;
      }),
    } as any;

    const mockSelection = {
      rangeCount: 1,
      getRangeAt: jest.fn(() => mockRange),
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
    } as any;

    const getSelectionSpy = jest.spyOn(assertWindow(), 'getSelection').mockReturnValue(mockSelection);

    const docBody = assertDocument().body;
    Object.defineProperty(document, 'activeElement', {
      value: docBody,
      writable: false,
      configurable: true,
    });

    const Component = () => {
      const ref = React.useRef<HTMLElement | null>(container);
      utils.useTrapTabNavigation(ref, undefined, true);
      return <div />;
    };

    renderer.act(() => {
      renderer.create(<Component />);
    });

    // Should have saved and restored selection when auto-focusing
    expect(getSelectionSpy).toHaveBeenCalled();
    expect(mockRange.cloneRange).toHaveBeenCalled();
    expect(mockSelection.removeAllRanges).toHaveBeenCalled();
    expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange);

    getSelectionSpy.mockRestore();
  });
  it('does not steal focus if element already has focus', () => {
    const container = assertDocument().createElement('div');
    const btn = assertDocument().createElement('button');

    Object.defineProperty(btn, 'offsetHeight', {
      value: 1000,
      writable: false,
    });

    container.appendChild(btn);
    const focusSpy = jest.spyOn(btn, 'focus');

    // Mock activeElement to return container (already has focus)
    Object.defineProperty(document, 'activeElement', {
      value: container,
      writable: false,
      configurable: true,
    });

    const Component = () => {
      const ref = React.useRef<HTMLElement | null>(container);
      utils.useTrapTabNavigation(ref, undefined, true);
      return <div />;
    };

    renderer.act(() => {
      renderer.create(<Component />);
    });

    // Should NOT focus because container already has focus
    expect(focusSpy).not.toHaveBeenCalled();

    focusSpy.mockRestore();
  });
  it('handles SSR errors gracefully', () => {
    const container = assertDocument().createElement('div');
    const btn = assertDocument().createElement('button');

    container.appendChild(btn);

    const getSelectionSpy = jest.spyOn(assertWindow(), 'getSelection').mockImplementation(() => {
      throw new Error('Window not available');
    });

    const docBody = assertDocument().body;
    Object.defineProperty(document, 'activeElement', {
      value: docBody,
      writable: false,
      configurable: true,
    });

    const Component = () => {
      const ref = React.useRef<HTMLElement | null>(container);
      utils.useTrapTabNavigation(ref, undefined, true);
      return <div />;
    };

    // Should not throw even with getSelection error
    expect(() => {
      renderer.act(() => {
        renderer.create(<Component />);
      });
    }).not.toThrow();

    getSelectionSpy.mockRestore();
  });
  it('handles null selection when auto-focusing', () => {
    const container = assertDocument().createElement('div');
    const btn = assertDocument().createElement('button');

    Object.defineProperty(btn, 'offsetHeight', {
      value: 1000,
      writable: false,
    });

    container.appendChild(btn);
    const focusSpy = jest.spyOn(btn, 'focus');

    const mockRange = {
      cloneRange: jest.fn(function(this: any) {
        return this;
      }),
    } as any;

    const mockSelection = {
      rangeCount: 1,
      getRangeAt: jest.fn(() => mockRange),
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
    } as any;

    let callCount = 0;
    const getSelectionSpy = jest.spyOn(assertWindow(), 'getSelection').mockImplementation(() => {
      callCount++;
      // Return valid selection for the first call (to save the range)
      // Return null for subsequent calls (to test the null handling in restoration)
      if (callCount === 1) {
        return mockSelection;
      }
      return null;
    });

    const docBody = assertDocument().body;
    Object.defineProperty(document, 'activeElement', {
      value: docBody,
      writable: false,
      configurable: true,
    });

    const Component = () => {
      const ref = React.useRef<HTMLElement | null>(container);
      utils.useTrapTabNavigation(ref, undefined, true);
      return <div />;
    };

    // Should not throw even when getSelection returns null
    expect(() => {
      renderer.act(() => {
        renderer.create(<Component />);
      });
    }).not.toThrow();

    // Should still focus the element
    expect(focusSpy).toHaveBeenCalled();

    getSelectionSpy.mockRestore();
    focusSpy.mockRestore();
  });

  it('skips auto-focus when no focusable elements exist', () => {
    const container = assertDocument().createElement('div');
    // Add only non-focusable elements
    const div = assertDocument().createElement('div');
    const span = assertDocument().createElement('span');
    container.appendChild(div);
    container.appendChild(span);

    const docBody = assertDocument().body;
    Object.defineProperty(document, 'activeElement', {
      value: docBody,
      writable: false,
      configurable: true,
    });

    const getSelectionSpy = jest.spyOn(assertWindow(), 'getSelection').mockReturnValue({
      rangeCount: 0,
    } as any);

    const Component = () => {
      const ref = React.useRef<HTMLElement | null>(container);
      utils.useTrapTabNavigation(ref, undefined, true);
      return <div />;
    };

    // Should not throw even when there are no focusable elements
    expect(() => {
      renderer.act(() => {
        renderer.create(<Component />);
      });
    }).not.toThrow();

    // getSelection is called to save selection, but focus() should not be called
    // because there are no focusable elements to focus
    expect(getSelectionSpy).toHaveBeenCalled();

    getSelectionSpy.mockRestore();
  });
});

describe('createTrapTab', () => {
  let trapTab: ReturnType<typeof utils.createTrapTab>;
  const htmlElement = assertDocument().createElement('div');
  const preventDefault = jest.fn();
  const d = assertDocument().createElement('div');
  const b = assertDocument().createElement('button');
  const i = assertDocument().createElement('input');
  let originalActiveElementDescriptor: PropertyDescriptor | undefined;

  htmlElement.appendChild(d); // not focusable
  htmlElement.appendChild(b);
  htmlElement.appendChild(i);

  Object.defineProperty(b, 'offsetHeight', {
    value: 1000,
    writable: false,
  });
  Object.defineProperty(i, 'offsetWidth', {
    value: 1000,
    writable: false,
  });

  beforeEach(() => {
    preventDefault.mockClear();
    trapTab = utils.createTrapTab(htmlElement);
    // Capture the original activeElement descriptor to restore it later
    originalActiveElementDescriptor = Object.getOwnPropertyDescriptor(document, 'activeElement');
  });

  afterEach(() => {
    // Restore the original activeElement descriptor or remove test overrides
    if (originalActiveElementDescriptor) {
      Object.defineProperty(document, 'activeElement', originalActiveElementDescriptor);
    } else {
      // If there was no own-property descriptor originally, remove any override created during the test
      delete (document as any).activeElement;
    }
  });
  it('ignores non-Tab events', () => {
    trapTab({ key: 'a' } as KeyboardEvent);
  });
  it('tabs forward (wrap around)', () => {
    b.focus = jest.fn();
    Object.defineProperty(document, 'activeElement', { value: i, writable: false, configurable: true });
    trapTab({ key: 'Tab', preventDefault } as unknown as KeyboardEvent);
    expect(b.focus).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
  });
  it('tabs backward (wrap around)', () => {
    i.focus = jest.fn();
    Object.defineProperty(document, 'activeElement', { value: b, writable: false, configurable: true });
    preventDefault.mockClear();
    trapTab({ key: 'Tab', shiftKey: true, preventDefault } as unknown as KeyboardEvent);
    expect(i.focus).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
  });
  it('tabs normally otherwise', () => {
    preventDefault.mockClear();

    Object.defineProperty(document, 'activeElement', { value: b, writable: false, configurable: true });
    trapTab({ key: 'Tab', preventDefault } as unknown as KeyboardEvent);

    Object.defineProperty(document, 'activeElement', { value: i, writable: false, configurable: true });
    trapTab({ key: 'Tab', shiftKey: true, preventDefault } as unknown as KeyboardEvent);
    expect(preventDefault).not.toHaveBeenCalled();
  });
  it('brings focus back from outside', () => {
    const outsideEl = assertDocument().createElement('button');
    b.focus = jest.fn();
    expect(b.focus).not.toHaveBeenCalled();
    Object.defineProperty(document, 'activeElement', { value: outsideEl, writable: false, configurable: true });
    preventDefault.mockClear();
    trapTab({ key: 'Tab', shiftKey: true, preventDefault } as unknown as KeyboardEvent);
    expect(b.focus).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
  });
  it('returns noop when given no valid containers', () => {
    const result = utils.createTrapTab({} as HTMLElement);
    expect(result({ key: 'Tab' } as KeyboardEvent)).toBeNull();
  });
  it('short circuits when no focusable elements', () => {
    const emptyEl = assertDocument().createElement('div');

    trapTab = utils.createTrapTab(emptyEl);
    trapTab({ key: 'Tab', shiftKey: true, preventDefault } as unknown as KeyboardEvent);
  });
  it('picks up dynamically added focusable elements', () => {
    const newBtn = assertDocument().createElement('button');
    Object.defineProperty(newBtn, 'offsetHeight', { value: 100, writable: false });
    htmlElement.appendChild(newBtn);

    newBtn.focus = jest.fn();
    Object.defineProperty(document, 'activeElement', { value: i, writable: false, configurable: true });
    preventDefault.mockClear();
    trapTab({ key: 'Tab', preventDefault } as unknown as KeyboardEvent);
    // newBtn is now the last focusable element, so tabbing from i (previously last) should not wrap
    expect(preventDefault).not.toHaveBeenCalled();

    // But tabbing from newBtn (new last) should wrap to first
    Object.defineProperty(document, 'activeElement', { value: newBtn, writable: false, configurable: true });
    b.focus = jest.fn();
    trapTab({ key: 'Tab', preventDefault } as unknown as KeyboardEvent);
    expect(b.focus).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();

    htmlElement.removeChild(newBtn);
  });
  it('handles dynamically removed focusable elements', () => {
    htmlElement.removeChild(i);

    // Now b is both first and last, so tabbing forward from b should wrap to b
    b.focus = jest.fn();
    Object.defineProperty(document, 'activeElement', { value: b, writable: false, configurable: true });
    preventDefault.mockClear();
    trapTab({ key: 'Tab', preventDefault } as unknown as KeyboardEvent);
    expect(b.focus).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();

    htmlElement.appendChild(i);
  });
  it('handles all focusable elements removed after creation', () => {
    htmlElement.removeChild(b);
    htmlElement.removeChild(i);

    preventDefault.mockClear();
    trapTab({ key: 'Tab', preventDefault } as unknown as KeyboardEvent);
    expect(preventDefault).not.toHaveBeenCalled();

    htmlElement.appendChild(b);
    htmlElement.appendChild(i);
  });
  it('preserves text selection when tab wraps around', () => {
    // Mock window.getSelection
    const mockRange = {
      cloneRange: jest.fn(function(this: any) {
        return this;
      }),
    } as any;

    const mockSelection = {
      rangeCount: 1,
      getRangeAt: jest.fn(() => mockRange),
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
    } as any;

    const getSelectionSpy = jest.spyOn(assertWindow(), 'getSelection').mockReturnValue(mockSelection);

    // Tab forward from the last element (should wrap)
    Object.defineProperty(document, 'activeElement', { value: i, writable: false, configurable: true });
    b.focus = jest.fn();
    preventDefault.mockClear();

    trapTab({ key: 'Tab', preventDefault } as unknown as KeyboardEvent);

    // Should have saved and restored selection
    expect(getSelectionSpy).toHaveBeenCalled();
    expect(mockRange.cloneRange).toHaveBeenCalled();
    expect(mockSelection.removeAllRanges).toHaveBeenCalled();
    expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange);
    expect(b.focus).toHaveBeenCalled();

    getSelectionSpy.mockRestore();
  });
  it('preserves text selection during normal tab navigation', () => {
    const mockRange = {
      cloneRange: jest.fn(function(this: any) {
        return this;
      }),
    } as any;

    const mockSelection = {
      rangeCount: 1,
      getRangeAt: jest.fn(() => mockRange),
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
    } as any;

    const getSelectionSpy = jest.spyOn(assertWindow(), 'getSelection').mockReturnValue(mockSelection);
    const rafSpy = jest.spyOn(assertWindow(), 'requestAnimationFrame').mockImplementation((cb: any) => {
      cb();
      return 1;
    });

    // Tab within the container (should not prevent default)
    Object.defineProperty(document, 'activeElement', { value: b, writable: false, configurable: true });
    preventDefault.mockClear();

    trapTab({ key: 'Tab', preventDefault } as unknown as KeyboardEvent);

    // Should schedule restoration via requestAnimationFrame
    expect(rafSpy).toHaveBeenCalled();
    expect(mockSelection.removeAllRanges).toHaveBeenCalled();
    expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange);
    expect(preventDefault).not.toHaveBeenCalled();

    getSelectionSpy.mockRestore();
    rafSpy.mockRestore();
  });
  it('handles no selection gracefully', () => {
    const mockSelection = {
      rangeCount: 0,
      getRangeAt: jest.fn(),
    } as any;

    const getSelectionSpy = jest.spyOn(assertWindow(), 'getSelection').mockReturnValue(mockSelection);

    // Tab forward from the last element
    Object.defineProperty(document, 'activeElement', { value: i, writable: false, configurable: true });
    b.focus = jest.fn();
    preventDefault.mockClear();

    trapTab({ key: 'Tab', preventDefault } as unknown as KeyboardEvent);

    // Should not throw even with no selection
    expect(b.focus).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();

    getSelectionSpy.mockRestore();
  });
  it('restores selection from outside focus', () => {
    const mockRange = {
      cloneRange: jest.fn(function(this: any) {
        return this;
      }),
    } as any;

    const mockSelection = {
      rangeCount: 1,
      getRangeAt: jest.fn(() => mockRange),
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
    } as any;

    const getSelectionSpy = jest.spyOn(assertWindow(), 'getSelection').mockReturnValue(mockSelection);

    const outsideEl = assertDocument().createElement('button');
    b.focus = jest.fn();
    preventDefault.mockClear();

    // Focus is outside the container
    Object.defineProperty(document, 'activeElement', { value: outsideEl, writable: false, configurable: true });

    trapTab({ key: 'Tab', shiftKey: true, preventDefault } as unknown as KeyboardEvent);

    // Should restore selection when bringing focus back
    expect(mockSelection.removeAllRanges).toHaveBeenCalled();
    expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange);
    expect(b.focus).toHaveBeenCalled();

    getSelectionSpy.mockRestore();
  });
  it('handles null selection gracefully when restoring', () => {
    const mockRange = {
      cloneRange: jest.fn(function(this: any) {
        return this;
      }),
    } as any;

    const mockSelection = {
      rangeCount: 1,
      getRangeAt: jest.fn(() => mockRange),
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
    } as any;

    let callCount = 0;
    const getSelectionSpy = jest.spyOn(assertWindow(), 'getSelection').mockImplementation(() => {
      callCount++;
      // Return valid selection for the first call (to save the range in createTrapTab)
      // Return null for subsequent calls (to test the null handling in restoration)
      if (callCount === 1) {
        return mockSelection;
      }
      return null;
    });

    // Create a new trapTab to capture the initial selection
    const newTrapTab = utils.createTrapTab(htmlElement);

    // Tab forward from the last element (should trigger restoration with null selection)
    Object.defineProperty(document, 'activeElement', { value: i, writable: false, configurable: true });
    b.focus = jest.fn();
    preventDefault.mockClear();

    newTrapTab({ key: 'Tab', preventDefault } as unknown as KeyboardEvent);

    // Should still focus even if getSelection returns null on restoration
    expect(b.focus).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();

    getSelectionSpy.mockRestore();
  });

  it('uses setTimeout fallback when requestAnimationFrame is not available', () => {
    const mockRange = {
      cloneRange: jest.fn(function(this: any) {
        return this;
      }),
    } as any;

    const mockSelection = {
      rangeCount: 1,
      getRangeAt: jest.fn(() => mockRange),
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
    } as any;

    const getSelectionSpy = jest.spyOn(assertWindow(), 'getSelection').mockReturnValue(mockSelection);
    
    // Mock requestAnimationFrame to be undefined
    const originalRAF = assertWindow().requestAnimationFrame;
    Object.defineProperty(assertWindow(), 'requestAnimationFrame', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const setTimeoutSpy = jest.spyOn(assertWindow(), 'setTimeout').mockImplementation((cb: any) => {
      cb();
      return 1 as any;
    });

    // Tab within the container (should not prevent default)
    Object.defineProperty(document, 'activeElement', { value: b, writable: false, configurable: true });
    preventDefault.mockClear();

    trapTab({ key: 'Tab', preventDefault } as unknown as KeyboardEvent);

    // Should schedule restoration via setTimeout fallback
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 0);
    expect(mockSelection.removeAllRanges).toHaveBeenCalled();
    expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange);
    expect(preventDefault).not.toHaveBeenCalled();

    // Restore original requestAnimationFrame
    Object.defineProperty(assertWindow(), 'requestAnimationFrame', {
      value: originalRAF,
      writable: true,
      configurable: true,
    });

    getSelectionSpy.mockRestore();
    setTimeoutSpy.mockRestore();
  });

  it('returns noop handler when containers list is empty', () => {
    // When no valid containers are passed, createTrapTab should skip
    // calling assertWindow() and return a noop function immediately.
    const result = utils.createTrapTab();
    
    // Should return null when handler is called
    expect(result({ key: 'Tab' } as KeyboardEvent)).toBeNull();
  });

  it('does nothing when no focusable elements in container', () => {
    const emptyContainer = assertDocument().createElement('div');
    const nonFocusableDiv = assertDocument().createElement('div');
    emptyContainer.appendChild(nonFocusableDiv);

    const emptyTrapTab = utils.createTrapTab(emptyContainer);

    // Should not throw when there are no focusable elements
    expect(() => {
      emptyTrapTab({ key: 'Tab', preventDefault } as unknown as KeyboardEvent);
    }).not.toThrow();

    // preventDefault should not be called since we short-circuit
    expect(preventDefault).not.toHaveBeenCalled();
  });
});

describe('onKeyHandler', () => {
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
    utils.onKeyHandler({ key: 'Escape' }, ref, true, () => null)();
    expect(addEventListener).toHaveBeenCalled();
  });

  it('doesn\'t register event listener when ref.current doesn\'t exist', () => {
    utils.onKeyHandler({ key: 'Escape' }, { current: null }, true, () => null)();
    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('removes event listener', () => {
    const removeEvListener = utils.onKeyHandler({ key: 'Escape' }, ref, true, () => null)();
    expect(removeEvListener).toBeDefined();
    removeEvListener!();
    expect(removeEventListener).toHaveBeenCalled();
  });

  it('clicking Escape invokes callback', () => {
    const testWindow = assertWindow();
    const cb = jest.fn();
    utils.onKeyHandler({ key: 'Escape' }, ref, true, cb)();

    const keyboardEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Escape',
      view: testWindow,
    });

    ref.current!.dispatchEvent(keyboardEvent);

    expect(cb).toHaveBeenCalled();
  });

  it('clicking other button doesn\'t invokes callback', () => {
    const testWindow = assertWindow();
    const cb = jest.fn();
    utils.onKeyHandler({ key: 'Escape' }, ref, true, cb)();

    const keyboardEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Other key',
      view: testWindow,
    });

    ref.current!.dispatchEvent(keyboardEvent);

    expect(cb).not.toHaveBeenCalled();
  });
});

describe('useMatchMobileQuery', () => {
  let Component: () => JSX.Element;

  beforeEach(() => {
    Component = () => {
      const matchMobileQuery = utils.useMatchMobileQuery();
      return <React.Fragment>
        {matchMobileQuery ? <div data-test-id='mobile-resolution' /> : <div data-test-id='desktop-resolution' />}
      </React.Fragment>;
    };
  });

  it('adds and removes listeners', () => {
    const mock = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    } as any as MediaQueryList;

    jest.spyOn(assertWindow(), 'matchMedia')
      .mockImplementation(() => mock);

    const component = renderer.create(<Component />);

    runHooks(renderer);

    expect(mock.addEventListener).toHaveBeenCalled();

    component.unmount();

    expect(mock.removeEventListener).toHaveBeenCalled();
  });

  it('adds and removes deprecated listeners on older browsers', () => {
    const mock = {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    } as any as MediaQueryList;

    jest.spyOn(assertWindow(), 'matchMedia')
      .mockImplementation(() => mock);

    const component = renderer.create(<Component />);

    runHooks(renderer);

    expect(mock.addListener).toHaveBeenCalled();

    component.unmount();

    expect(mock.removeListener).toHaveBeenCalled();
  });

  it('updates on listener calls', () => {
    const mock = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    } as any as MediaQueryList;

    jest.spyOn(assertWindow(), 'matchMedia')
      .mockImplementation(() => mock);

    const component = renderer.create(<Component />);

    runHooks(renderer);

    renderer.act(() => {
      (mock.addEventListener as any as jest.SpyInstance).mock.calls[0][1]({ matches: true });
    });

    expect(() => component.root.findByProps({ 'data-test-id': 'mobile-resolution' })).not.toThrow();
    expect(() => component.root.findByProps({ 'data-test-id': 'desktop-resolution' })).toThrow();

    renderer.act(() => {
      (mock.addEventListener as any as jest.SpyInstance).mock.calls[0][1]({ matches: false });
    });

    expect(() => component.root.findByProps({ 'data-test-id': 'mobile-resolution' })).toThrow();
    expect(() => component.root.findByProps({ 'data-test-id': 'desktop-resolution' })).not.toThrow();
  });
});

describe('useOnScrollTopOffset', () => {
  let Component: () => JSX.Element;

  beforeEach(() => {
    Component = () => {
      const scrollTopOffset = utils.useOnScrollTopOffset();

      if (scrollTopOffset > 100) {
        return <div data-test-id='more-than-100' />;
      }

      return <div data-test-id='less-than-100' />;
    };
  });

  it('adds and removes listeners', () => {
    const spyAddListener = jest.spyOn(assertDocument(), 'addEventListener');
    const spyRemoveListener = jest.spyOn(assertDocument(), 'removeEventListener');

    const component = renderer.create(<Component />);

    runHooks(renderer);

    expect(spyAddListener).toHaveBeenCalled();

    component.unmount();

    expect(spyRemoveListener).toHaveBeenCalled();

    spyAddListener.mockClear();
    spyRemoveListener.mockClear();
  });

  it('updates on listener calls', () => {
    const document = assertDocument();
    const spyAddListener = jest.spyOn(document, 'addEventListener');

    const component = renderer.create(<Component />);

    runHooks(renderer);

    Object.defineProperty(document, 'scrollingElement', {
      value: null,
      writable: true,
    });

    renderer.act(() => {
      (spyAddListener as any as jest.SpyInstance).mock.calls[0][1]();
    });

    expect(() => component.root.findByProps({ 'data-test-id': 'more-than-100' })).toThrow();
    expect(() => component.root.findByProps({ 'data-test-id': 'less-than-100' })).not.toThrow();

    Object.defineProperty(document, 'scrollingElement', {
      value: { scrollTop: 101 },
      writable: true,
    });

    renderer.act(() => {
      (spyAddListener as any as jest.SpyInstance).mock.calls[0][1]();
    });

    expect(() => component.root.findByProps({ 'data-test-id': 'more-than-100' })).not.toThrow();
    expect(() => component.root.findByProps({ 'data-test-id': 'less-than-100' })).toThrow();

    Object.defineProperty(document, 'scrollingElement', {
      value: { scrollTop: 99 },
      writable: true,
    });

    renderer.act(() => {
      (spyAddListener as any as jest.SpyInstance).mock.calls[0][1]();
    });

    expect(() => component.root.findByProps({ 'data-test-id': 'more-than-100' })).toThrow();
    expect(() => component.root.findByProps({ 'data-test-id': 'less-than-100' })).not.toThrow();

    spyAddListener.mockClear();
  });
});

describe('useDisableContentTabbing', () => {
  const document = assertDocument();
  const root = document.createElement('div');
  root.setAttribute('id', 'root');
  document.body.append(root);

  const tabbableChild = document.createElement('a');
  tabbableChild.setAttribute('href', 'something');
  root.append(tabbableChild);

  const notTabbablechild = document.createElement('span');
  root.append(notTabbablechild);

  const tabbableChildWithTabIndex = document.createElement('span');
  tabbableChildWithTabIndex.setAttribute('tabindex', '2');
  root.append(tabbableChildWithTabIndex);

  const tabbableElementOutsideOfTheRoot = document.createElement('a');
  tabbableElementOutsideOfTheRoot.setAttribute('href', 'asd');
  document.body.append(tabbableElementOutsideOfTheRoot);

  const reverse = utils.disableContentTabbingHandler(true)();

  if (!reverse) {
    return expect(reverse).toBeTruthy();
  }

  expect(tabbableChild.getAttribute('tabindex')).toEqual('-1');
  expect(notTabbablechild.getAttribute('tabindex')).toEqual(null);
  expect(tabbableChildWithTabIndex.getAttribute('tabindex')).toEqual('-1');
  expect(tabbableChildWithTabIndex.getAttribute('data-prev-tabindex')).toEqual('2');
  expect(tabbableElementOutsideOfTheRoot.getAttribute('tabindex')).toEqual(null);

  reverse();

  expect(tabbableChild.getAttribute('tabindex')).toEqual(null);
  expect(notTabbablechild.getAttribute('tabindex')).toEqual(null);
  expect(tabbableChildWithTabIndex.getAttribute('tabindex')).toEqual('2');
  expect(tabbableChildWithTabIndex.getAttribute('data-prev-tabindex')).toEqual(null);
  expect(tabbableElementOutsideOfTheRoot.getAttribute('tabindex')).toEqual(null);
});

describe('keyboardEventMatchesCombination', () => {
  it('return false if event and options differs', () => {
    expect(utils.keyboardEventMatchesCombination(
      { key: 'a', ctrlKey: true, altKey: true, shiftKey: true },
      { key: 'a', ctrlKey: true, altKey: true, shiftKey: false } as any
    )).toEqual(false);

    expect(utils.keyboardEventMatchesCombination(
      { key: 'a', ctrlKey: true, altKey: true },
      { key: 'a', ctrlKey: true, altKey: false } as any
    )).toEqual(false);

    expect(utils.keyboardEventMatchesCombination(
      { key: 'a', ctrlKey: true },
      { key: 'a', ctrlKey: false } as any
    )).toEqual(false);

    expect(utils.keyboardEventMatchesCombination(
      { key: 'a', ctrlKey: undefined },
      { key: 'a', ctrlKey: true } as any
    )).toEqual(false);

    expect(utils.keyboardEventMatchesCombination(
      { key: 'a' },
      { key: 'b' } as any
    )).toEqual(false);
  });

  it('return true if all of the options are of the same values in the event', () => {
    expect(utils.keyboardEventMatchesCombination(
      { key: 'a', ctrlKey: true, altKey: true, shiftKey: true },
      { key: 'A', ctrlKey: true, altKey: true, shiftKey: true } as any
    )).toEqual(true);

    // Returns true because altKey is not specified in the options
    expect(utils.keyboardEventMatchesCombination(
      { key: 'a', ctrlKey: true },
      { key: 'a', ctrlKey: true, altKey: false } as any
    )).toEqual(true);
  });
});

describe('useFocusHighlight', () => {
  let showCard: jest.Mock;
  let container: HTMLElement;
  let highlightElement: HTMLElement;
  let highlights: Highlight[];

  const TestComponent = ({
    highlightsList,
    callback,
  }: {
    highlightsList: Highlight[];
    callback: (id: string) => void;
  }) => {
    utils.useFocusHighlight(callback, highlightsList);
    return (
      <div>
        <div tabIndex={0} id='outside'>Outside</div>
        <mark id='highlight' tabIndex={0}>
          <span id='highlight-span' tabIndex={0}>Highlight text</span>
        </mark>
      </div>
    );
  };

  beforeEach(() => {
    showCard = jest.fn();
    container = assertDocument().createElement('div');
    assertDocument().body.appendChild(container);

    // Initial mount to access <span>
    act(() => {
      ReactDOM.render(
        <TestComponent highlightsList={[]} callback={showCard} />,
        container
      );
    });

    highlightElement = container.querySelector('#highlight-span')!;
    highlights = [{ id: 'h1', elements: [highlightElement] } as any as Highlight];

    // Re-mount with highlights
    act(() => {
      ReactDOM.render(
        <TestComponent highlightsList={highlights} callback={showCard} />,
        container
      );
    });
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
    showCard.mockReset();
    jest.clearAllMocks();
  });

  it('calls showCard on focusin of highlight span', () => {
    const span = container.querySelector('#highlight-span')!;
    span.dispatchEvent(new Event('focusin', { bubbles: true }));
    expect(showCard).toHaveBeenCalledWith('h1');
  });

  it('calls showCard on click on mark', () => {
    const mark = container.querySelector('#highlight')!;
    mark.dispatchEvent(new Event('click', { bubbles: true }));
    expect(showCard).toHaveBeenCalledWith('h1');
  });

  it('does not call showCard when clicking outside', () => {
    const outside = container.querySelector('#outside')!;
    outside.dispatchEvent(new Event('click', { bubbles: true }));
    expect(showCard).not.toHaveBeenCalled();
  });

  it('does not call showCard when focusing outside', () => {
    const outside = container.querySelector('#outside')!;
    outside.dispatchEvent(new Event('focusin', { bubbles: true }));
    expect(showCard).not.toHaveBeenCalled();
  });

  it('does not call showCard if event.target is not an element', () => {
    const document = assertDocument();
    const fakeEvent = new Event('click');
    Object.defineProperty(fakeEvent, 'target', { value: null });
    document.dispatchEvent(fakeEvent);
    expect(showCard).not.toHaveBeenCalled();
  });
});

describe('useDrawFocus', () => {
  it('focuses element on mount', () => {
    const htmlElement = assertDocument().createElement('button');
    const focusSpy = jest.spyOn(htmlElement, 'focus');

    const Component = () => {
      const innerRef = utils.useDrawFocus<HTMLElement>();
      // Set the ref to the element so the hook can focus it
      React.useLayoutEffect(() => {
        (innerRef as any).current = htmlElement;
      }, []);
      return <div />;
    };

    renderer.act(() => {
      renderer.create(<Component />);
    });

    // The hook should have called focus() on the element
    expect(focusSpy).toHaveBeenCalled();
    focusSpy.mockRestore();
  });

  it('returns a ref object', () => {
    const Component = () => {
      const ref = utils.useDrawFocus();
      expect(ref.current).toBeNull();
      return <div />;
    };

    renderer.create(<Component />);
  });
});

describe('useFocusElement', () => {
  it('focuses element when shouldFocus is true', () => {
    const htmlElement = assertDocument().createElement('button');
    const focusSpy = jest.spyOn(htmlElement, 'focus');
    const ref = React.createRef<HTMLElement>();

    const Component = ({ shouldFocus }: { shouldFocus: boolean }) => {
      React.useEffect(() => {
        (ref as any).current = htmlElement;
      }, []);
      utils.useFocusElement(ref, shouldFocus);
      return <div />;
    };

    const tr = renderer.create(<Component shouldFocus={false} />);

    renderer.act(() => {
      tr.update(<Component shouldFocus={true} />);
    });

    expect(focusSpy).toHaveBeenCalled();
    focusSpy.mockRestore();
  });

  it('does not focus when shouldFocus is false', () => {
    const htmlElement = assertDocument().createElement('button');
    const focusSpy = jest.spyOn(htmlElement, 'focus');
    const ref = React.createRef<HTMLElement>();

    const Component = () => {
      React.useEffect(() => {
        (ref as any).current = htmlElement;
      }, []);
      utils.useFocusElement(ref, false);
      return <div />;
    };

    renderer.create(<Component />);

    expect(focusSpy).not.toHaveBeenCalled();
    focusSpy.mockRestore();
  });

  it('does nothing when element is null', () => {
    const ref = React.createRef<HTMLElement>();

    const Component = () => {
      utils.useFocusElement(ref, true);
      return <div />;
    };

    expect(() => {
      renderer.create(<Component />);
    }).not.toThrow();
  });
});

describe('useFocusLost', () => {
  it('registers focusout event listener', () => {
    const htmlElement = assertDocument().createElement('div');
    const callback = jest.fn();
    const ref = React.createRef<HTMLElement>();

    const addEventListenerSpy = jest.spyOn(htmlElement, 'addEventListener');

    const Component = () => {
      React.useEffect(() => {
        // Manually set the ref to the element for testing
        (ref as any).current = htmlElement;
      }, []);
      utils.useFocusLost(ref, true, callback);
      return <div />;
    };

    renderer.act(() => {
      renderer.create(<Component />);
    });

    expect(addEventListenerSpy).toHaveBeenCalledWith('focusout', expect.any(Function));

    addEventListenerSpy.mockRestore();
  });

  it('does not register listener when disabled', () => {
    const htmlElement = assertDocument().createElement('div');
    const callback = jest.fn();
    const ref = React.createRef<HTMLElement>();

    const addEventListenerSpy = jest.spyOn(htmlElement, 'addEventListener');

    const Component = () => {
      React.useEffect(() => {
        (ref as any).current = htmlElement;
      }, []);
      utils.useFocusLost(ref, false, callback);
      return <div />;
    };

    renderer.act(() => {
      renderer.create(<Component />);
    });

    expect(addEventListenerSpy).not.toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });
});

describe('useFocusIn', () => {
  it('registers focusin event listener', () => {
    const htmlElement = assertDocument().createElement('div');
    const callback = jest.fn();
    const ref = React.createRef<HTMLElement>();

    const addEventListenerSpy = jest.spyOn(htmlElement, 'addEventListener');

    const Component = () => {
      React.useEffect(() => {
        // Manually set the ref to the element for testing
        (ref as any).current = htmlElement;
      }, []);
      utils.useFocusIn(ref, true, callback);
      return <div />;
    };

    renderer.act(() => {
      renderer.create(<Component />);
    });

    expect(addEventListenerSpy).toHaveBeenCalledWith('focusin', expect.any(Function));

    addEventListenerSpy.mockRestore();
  });
  it('does not register listener when disabled', () => {
    const htmlElement = assertDocument().createElement('div');
    const callback = jest.fn();
    const ref = React.createRef<HTMLElement>();

    const addEventListenerSpy = jest.spyOn(htmlElement, 'addEventListener');

    const Component = () => {
      React.useEffect(() => {
        (ref as any).current = htmlElement;
      }, []);
      utils.useFocusIn(ref, false, callback);
      return <div />;
    };

    renderer.act(() => {
      renderer.create(<Component />);
    });

    expect(addEventListenerSpy).not.toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });
});

describe('focusableItemQuery', () => {
  it('is a valid CSS selector', () => {
    const div = assertDocument().createElement('div');

    // Add various focusable elements
    const btn = assertDocument().createElement('button');
    const input = assertDocument().createElement('input');
    const link = assertDocument().createElement('a');
    link.href = 'https://example.com';
    const select = assertDocument().createElement('select');
    const textarea = assertDocument().createElement('textarea');

    div.appendChild(btn);
    div.appendChild(input);
    div.appendChild(link);
    div.appendChild(select);
    div.appendChild(textarea);

    const focusable = Array.from(div.querySelectorAll(utils.focusableItemQuery))
      .filter((el: any) => !el.disabled && el.tabIndex !== -1);

    expect(focusable.length).toBe(5);
    expect(focusable).toContain(btn);
    expect(focusable).toContain(input);
    expect(focusable).toContain(link);
    expect(focusable).toContain(select);
    expect(focusable).toContain(textarea);
  });

  it('excludes disabled elements', () => {
    const div = assertDocument().createElement('div');

    const btn = assertDocument().createElement('button');
    const disabledBtn = assertDocument().createElement('button');
    disabledBtn.disabled = true;

    div.appendChild(btn);
    div.appendChild(disabledBtn);

    const focusable = Array.from(div.querySelectorAll(utils.focusableItemQuery))
      .filter((el: any) => !el.disabled && el.tabIndex !== -1);

    expect(focusable.length).toBe(1);
    expect(focusable).toContain(btn);
    expect(focusable).not.toContain(disabledBtn);
  });

  it('excludes tabindex=-1 elements', () => {
    const div = assertDocument().createElement('div');

    const btn = assertDocument().createElement('button');
    const notTabbableBtn = assertDocument().createElement('button');
    notTabbableBtn.tabIndex = -1;

    div.appendChild(btn);
    div.appendChild(notTabbableBtn);

    const focusable = Array.from(div.querySelectorAll(utils.focusableItemQuery))
      .filter((el: any) => el.tabIndex !== -1);

    expect(focusable.length).toBe(1);
    expect(focusable).toContain(btn);
    expect(focusable).not.toContain(notTabbableBtn);
  });

  it('includes tabindex >= 0 elements', () => {
    const div = assertDocument().createElement('div');

    const span = assertDocument().createElement('span');
    span.tabIndex = 0;

    div.appendChild(span);

    const focusable = div.querySelectorAll(utils.focusableItemQuery);

    expect(focusable.length).toBe(1);
    expect(Array.from(focusable)).toContain(span);
  });
});
