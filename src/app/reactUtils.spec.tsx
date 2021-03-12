import { HTMLElement, MediaQueryList } from '@openstax/types/lib.dom';
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

describe('useMatchMobileQuery', () => {
  // tslint:disable-next-line: variable-name
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
      addListener: jest.fn(),
      removeListener: jest.fn(),
    } as any as MediaQueryList;

    jest.spyOn(assertWindow(), 'matchMedia')
      .mockImplementation(() => mock);

    const component = renderer.create(<Component/>);

    // Call hook
    // tslint:disable-next-line: no-empty
    renderer.act(() => {});

    expect(mock.addListener).toHaveBeenCalled();

    component.unmount();

    expect(mock.removeListener).toHaveBeenCalled();
  });

  it('updates on listener calls', () => {
    const mock = {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    } as any as MediaQueryList;

    jest.spyOn(assertWindow(), 'matchMedia')
      .mockImplementation(() => mock);

    const component = renderer.create(<Component/>);

    // Call hook
    // tslint:disable-next-line: no-empty
    renderer.act(() => {});

    renderer.act(() => {
      (mock.addListener as any as jest.SpyInstance).mock.calls[0][0]({ matches: true });
    });

    expect(() => component.root.findByProps({ 'data-test-id': 'mobile-resolution' })).not.toThrow();
    expect(() => component.root.findByProps({ 'data-test-id': 'desktop-resolution' })).toThrow();

    renderer.act(() => {
      (mock.addListener as any as jest.SpyInstance).mock.calls[0][0]({ matches: false });
    });

    expect(() => component.root.findByProps({ 'data-test-id': 'mobile-resolution' })).toThrow();
    expect(() => component.root.findByProps({ 'data-test-id': 'desktop-resolution' })).not.toThrow();
  });
});

describe('useOnScrollTopOffset', () => {
  // tslint:disable-next-line: variable-name
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

    const component = renderer.create(<Component/>);

    // Call hook
    // tslint:disable-next-line: no-empty
    renderer.act(() => {});

    expect(spyAddListener).toHaveBeenCalled();

    component.unmount();

    expect(spyRemoveListener).toHaveBeenCalled();

    spyAddListener.mockClear();
    spyRemoveListener.mockClear();
  });

  it('updates on listener calls', () => {
    const document = assertDocument();
    const spyAddListener = jest.spyOn(document, 'addEventListener');

    const component = renderer.create(<Component/>);

    // Call hook
    // tslint:disable-next-line: no-empty
    renderer.act(() => {});

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
