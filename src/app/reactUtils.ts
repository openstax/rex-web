import { Element, FocusEvent, HTMLElement,
  HTMLElementEventMap, KeyboardEvent, MediaQueryListEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { addSafeEventListener } from './domUtils';
import { isElement, isWindow } from './guards';
import theme from './theme';
import { assertDefined, assertDocument, assertWindow } from './utils';

export const useDrawFocus = <E extends HTMLElement = HTMLElement>() => {
  const ref = React.useRef<E | null>(null);

  React.useEffect(() => {
    if (ref && ref.current) {
      ref.current.focus();
    }
  }, [ref]);

  return ref;
};

export const onFocusInOrOutHandler = (
  ref: React.RefObject<HTMLElement>,
  isEnabled: boolean,
  cb: () => void,
  type: 'focusin' | 'focusout'
) => () => {
  const el = ref && ref.current;
  if (!el) { return; }

  const handler = (event: FocusEvent) => {
    const target = type === 'focusout'
      ? event.relatedTarget
      : event.target;

    if (
      type === 'focusout'
      && (!isElement(target) || !ref.current!.contains(target))
    ) {
      cb();
    } else if (
      type === 'focusin'
      && (isElement(target) && ref.current!.contains(target))
    ) {
      cb();
    }
  };

  if (isEnabled) {
    return addSafeEventListener(el, type, handler);
  }
};

export const useFocusLost = (ref: React.RefObject<HTMLElement>, isEnabled: boolean, cb: () => void) => {
  React.useEffect(onFocusInOrOutHandler(ref, isEnabled, cb, 'focusout'), [ref, isEnabled]);
};

export const useFocusIn = (ref: React.RefObject<HTMLElement>, isEnabled: boolean, cb: () => void) => {
  React.useEffect(onFocusInOrOutHandler(ref, isEnabled, cb, 'focusin'), [ref, isEnabled]);
};

export const onDOMEventHandler = (
  element: React.RefObject<HTMLElement> | Window,
  isEnabled: boolean,
  event: keyof HTMLElementEventMap,
  cb: () => void
) => () => {
  const target = isWindow(element) ? element : element.current;

  if (!target) { return; }

  if (isEnabled) {
    target.addEventListener(event, cb);
  }

  return () => target.removeEventListener(event, cb);
};

export const useOnDOMEvent = (
  element: React.RefObject<HTMLElement> | Window ,
  isEnabled: boolean,
  event: keyof HTMLElementEventMap,
  cb: () => void,
  deps: React.DependencyList = []
) => {
  React.useEffect(onDOMEventHandler(element, isEnabled, event, cb), [element, isEnabled, event, cb, ...deps]);
};

export const useTimeout = (delay: number, callback: () => void) => {
  const savedCallback = React.useRef<typeof callback>();
  const timeout = React.useRef<number>();

  const timeoutHandler = () => savedCallback.current && savedCallback.current();
  const reset = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(timeoutHandler, delay);
  };

  React.useEffect(() => {
    savedCallback.current = callback;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback]);

  React.useEffect(() => {
      reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);

  React.useEffect(() => () => clearTimeout(assertDefined(timeout.current, 'timeout ID can\'t be undefined')), []);

  return reset;
};

/**
 * This function will return array where first item is a function which will set
 * event listener for given element and second item is a function which will remove
 * this listener.
 *
 * This function can be used in React class components.
 */
export const onEsc = (
  element: HTMLElement, cb: () => void
): [() => void, () => void] => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      cb();
    }
  };

  return [
    () => element.addEventListener('keydown', handler),
    () => element.removeEventListener('keydown', handler),
  ];
};

export const onEscHandler = (element: React.RefObject<HTMLElement>, isEnabled: boolean, cb: () => void) => () => {
  const el = element && element.current;
  if (!el) { return; }

  const [addEvListener, removeEvListener] = onEsc(el, cb);
  if (isEnabled) {
    addEvListener();
  }

  return removeEvListener;
};

export const useOnEsc = (element: React.RefObject<HTMLElement>, isEnabled: boolean, cb: () => void) => {
  React.useEffect(onEscHandler(element, isEnabled, cb), [element, isEnabled, cb]);
};

export const useMatchMobileQuery = () => {
  const matchMedia = assertWindow().matchMedia(theme.breakpoints.mobileQuery);
  const [isMobile, setIsMobile] = React.useState(matchMedia.matches);

  const listener = React.useCallback((e: EventListener) => {
    if ((e as MediaQueryListEvent).matches) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, []);

  React.useEffect(() => {
    matchMedia.addListener(listener);
    return () => { matchMedia.removeListener(listener); };
  }, [listener, matchMedia]);

  return isMobile;
};

export const useDebouncedWindowSize = () => {
  const window = assertWindow();
  const timeout = React.useRef(0);
  const [size, setSize] = React.useState([window.innerWidth, window.innerHeight]);

  React.useLayoutEffect(() => {
    const updateSize = () => {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        setSize([window.innerWidth, window.innerHeight]);
      }, 50);
    };
    window.addEventListener('resize', updateSize);
    return () => {
      clearTimeout(timeout.current);
      window.removeEventListener('resize', updateSize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return size;
};

export const useOnScrollTopOffset = () => {
  const document = assertDocument();
  const [topOffset, setTopOffset] = React.useState(0);

  const listener = React.useCallback(() => {
    setTopOffset(document.scrollingElement ? document.scrollingElement.scrollTop : 0);
  }, [document]);

  React.useEffect(() => {
    document.addEventListener('scroll', listener);
    return () => { document.removeEventListener('scroll', listener); };
  }, [document, listener]);

  return topOffset;
};

// This list is based on the comment from
// https://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus/30753870#30753870
// and https://allyjs.io/data-tables/focusable.html
const tabbableElementsSelector = [
  'a[href]',
  'area[href]',
  'audio',
  'button:not([disabled])',
  'details',
  'embed',
  'iframe',
  'input:not([disabled])',
  'select:not([disabled])',
  'summary',
  'textarea:not([disabled])',
  'object',
  // In Firefox elements with overflow: auto / scroll are tabbable if they are scrollable
  // and ToC is one of these elements so we add `ol` to this list.
  'ol',
  'video',
  '[contentEditable=true]',
  '[tabindex]',
].map((el) => el + `:not([tabindex='-1'])`).join(',');

export const disableContentTabbingHandler = (isEnabled: boolean) => () => {
  if (!isEnabled) { return; }
  const root = assertDocument().querySelector('#root');
  if (!root) { return; }

  root.setAttribute('aria-hidden', 'true');
  const tabbable = root.querySelectorAll(tabbableElementsSelector);

  tabbable.forEach((el) => {
    const currentTabIndex = el.getAttribute('tabindex');
    el.setAttribute('tabindex', '-1');
    if (currentTabIndex) {
      el.setAttribute('data-prev-tabindex', currentTabIndex);
    }
  });

  return () => {
    root.removeAttribute('aria-hidden');
    tabbable.forEach((el) => {
      const prevTabIndex = el.getAttribute('data-prev-tabindex');
      if (prevTabIndex) {
        el.setAttribute('tabindex', prevTabIndex);
        el.removeAttribute('data-prev-tabindex');
      } else {
        el.removeAttribute('tabindex');
      }
    });
  };
};

export const useDisableContentTabbing = (isEnabled: boolean) => {
  React.useEffect(disableContentTabbingHandler(isEnabled), [isEnabled]);
};

export type KeyCombinationOptions = Partial<Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'key' | 'metaKey' | 'shiftKey'>>;

/**
 * Compare @param options key-value pairs with properties from @param event
 * If both values are of type string they are changed to lower case before comparing.
 */
export const keyboardEventMatchesCombination = (options: KeyCombinationOptions, event: KeyboardEvent): boolean => {
  const entries = Object.entries(options) as Array<[
    keyof KeyCombinationOptions,
    KeyCombinationOptions[keyof KeyCombinationOptions]
  ]>;
  for (const [option, value] of entries) {
    const eventValue = event[option];
    if (
      (typeof value === 'string' && typeof eventValue === 'string')
      && value.toLowerCase() === eventValue.toLowerCase()
    ) {
      continue;
    }
    if (value !== eventValue) {
      return false;
    }
  }
  return true;
};

/**
 * Attach keydown event listener to the document and check if clicked keys are matching @param options
 * @param {KeyCombinationOptions} options
 * @param {Function} callback
 */
export const useKeyCombination = (
  options: KeyCombinationOptions,
  callback: (event: KeyboardEvent) => void,
  noopHandler?: (activeElement: Element) => boolean
) => {
  const document = assertDocument();

  const handler = React.useCallback((event: KeyboardEvent) => {
    if (noopHandler && isElement(event.target) && noopHandler(event.target)) {
      return;
    }
    if (keyboardEventMatchesCombination(options, event)) {
      event.preventDefault();
      callback(event);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, options]);

  React.useEffect(() => {
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [document, handler]);
};
