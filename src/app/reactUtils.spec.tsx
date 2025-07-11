import type { KeyboardEvent, MediaQueryList, HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import { resetModules, runHooks } from '../test/utils';
import * as utils from './reactUtils';
import { assertDocument, assertWindow } from './utils';
import { dispatchKeyDownEvent } from '../test/reactutils';
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
    const window = assertWindow();
    const cb = jest.fn();
    utils.onFocusInOrOutHandler(ref, true, cb, 'focusout')();

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
    utils.onFocusInOrOutHandler(ref, true, cb, 'focusout')();

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
    const window = assertWindow();
    const cb = jest.fn();
    utils.onFocusInOrOutHandler(ref, true, cb, 'focusin')();

    const focusinEvent = window.document.createEvent('FocusEvent');
    Object.defineProperty(focusinEvent, 'target', {
      value: childElement,
      writable: false,
    });
    focusinEvent.initEvent('focusin', true, false);

    ref.current!.dispatchEvent(focusinEvent);

    expect(cb).toHaveBeenCalled();
  });

  it('noops when clicking on sibling item', () => {
    const window = assertWindow();
    const cb = jest.fn();
    utils.onFocusInOrOutHandler(ref, true, cb, 'focusin')();

    const focusinEvent = window.document.createEvent('FocusEvent');
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

describe('useTrapTabNavigation', () => {
  let window;
  let addEventListener: jest.SpyInstance;

  beforeEach(() => {
    window = assertWindow();

    addEventListener = jest.spyOn(window.document, 'addEventListener');
  });

  function Component() {
    const container = assertDocument().createElement('div');
    const b = assertDocument().createElement('button');

    container.appendChild(b);
    const ref = React.useRef<HTMLElement | null>(container);
    utils.useTrapTabNavigation(ref);

    return <div />;
  }

  it('short circuits if no ref element', () => {
    renderer.create(<Component />);
    expect(addEventListener).not.toHaveBeenCalled();
  });
  it('attaches listeners', () => {
    const tr = renderer.create(<Component />);

    renderer.act(
      () => {
        dispatchKeyDownEvent({ key: 'Tab' });
      }
    );
    tr.unmount();
  });
});

describe('createTrapTab', () => {
  let trapTab: ReturnType<typeof utils.createTrapTab>;
  const htmlElement = assertDocument().createElement('div');
  const preventDefault = jest.fn();
  const d = assertDocument().createElement('div');
  const b = assertDocument().createElement('button');
  const i = assertDocument().createElement('input');

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
    trapTab = utils.createTrapTab(htmlElement);
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
  it('short circuits when no focusable elements', () => {
    const emptyEl = assertDocument().createElement('div');

    trapTab = utils.createTrapTab(emptyEl);
    trapTab({ key: 'Tab', shiftKey: true, preventDefault } as unknown as KeyboardEvent);
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
    const window = assertWindow();
    const cb = jest.fn();
    utils.onKeyHandler({ key: 'Escape' }, ref, true, cb)();

    const keyboardEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Escape',
      view: window,
    });

    ref.current!.dispatchEvent(keyboardEvent);

    expect(cb).toHaveBeenCalled();
  });

  it('clicking other button doesn\'t invokes callback', () => {
    const window = assertWindow();
    const cb = jest.fn();
    utils.onKeyHandler({ key: 'Escape' }, ref, true, cb)();

    const keyboardEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Other key',
      view: window,
    });

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

  // tslint:disable-next-line: variable-name
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
