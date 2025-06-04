import type { Document, Element, FocusEvent, HTMLElement, Event,
  HTMLElementEventMap, KeyboardEvent, MediaQueryListEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { addSafeEventListener } from './domUtils';
import { isElement, isTextInputHtmlElement, isWindow } from './guards';
import theme from './theme';
import { assertDefined, assertDocument, assertWindow } from './utils';
import { Highlight } from '@openstax/highlighter';

export const useDrawFocus = <E extends HTMLElement = HTMLElement>() => {
  const ref = React.useRef<E>(null);

  React.useEffect(() => {
    if (ref && ref.current) {
      ref.current.focus();
    }
  }, [ref]);

  return ref;
};

function isHidden(el: HTMLElement) {
  return el.offsetWidth === 0 && el.offsetHeight === 0;
}

export const focusableItemQuery = [
  'button', 'input', 'select', 'textarea', '[href]', '[tabindex]:not([tabindex="-1"]',
].map((s) => s.includes('[') ? s : `${s}:not([disabled])`).join(',');

function ringAdd(arr: unknown[], a: number, b: number) {
  return (arr.length + a + b) % arr.length;
}

// Exported to allow testing
export function createTrapTab(...elements: HTMLElement[]) {
  const focusableElements = elements
  .filter(c => c  && 'querySelectorAll' in c) // in some tests, this gets garbage
  .map(
    (container) => {
      const contents = Array.from(container.querySelectorAll<HTMLElement>(focusableItemQuery))
        .filter((el) => !isHidden(el));

      return {
        container,
        firstEl: contents[0],
        lastEl: contents[contents.length - 1],
      };
    }
  ).filter((c) => c.firstEl);

  if (focusableElements.length === 0) {
    return () => null;
  }

  // A typical implementation, adapted for crossing multiple containers
  // e.g. https://hidde.blog/using-javascript-to-trap-focus-in-an-element/
  return (event: KeyboardEvent) => {
    if (event.key !== 'Tab') { return; }

    // Keep track of where we came from
    const startEl = document?.activeElement as HTMLElement;
    const feEntry = focusableElements.find((entry) => entry.container.contains(startEl));

    // Focus has escaped the trap
    if (!feEntry) {
      focusableElements[0].firstEl.focus();
      event.preventDefault();
      return;
    }

    // Move to the next container
    if (event.shiftKey) {
      if (startEl === feEntry.firstEl) {
        const feIdx = focusableElements.indexOf(feEntry);
        const newIdx = ringAdd(focusableElements, feIdx, -1);

        focusableElements[newIdx].lastEl.focus();
        event.preventDefault();
      }
    } else if (startEl === feEntry.lastEl) {
      const feIdx = focusableElements.indexOf(feEntry);
      const newIdx = ringAdd(focusableElements, feIdx, 1);

      focusableElements[newIdx].firstEl.focus();
      event.preventDefault();
    }
  };
}

  // Supply otherDep in cases where the focusable elements might change due to
  // additional dependencies (combine them into one variable): see EditCard
  export function useTrapTabNavigation(
    ref: React.MutableRefObject<HTMLElement | null>,
    otherDep?: unknown
  ) {
    React.useEffect(
      () => {
        const el = ref.current;
        if (!el?.addEventListener) {
          return;
        }
        const trapTab = createTrapTab(el);

        el.addEventListener('keydown', trapTab, true);

        return () => el.removeEventListener('keydown', trapTab, true);
      },
      [ref, otherDep]
    );
}

export const onFocusInOrOutHandler = (
  ref: React.RefObject<HTMLElement>,
  isEnabled: boolean,
  cb: () => void,
  type: 'focusin' | 'focusout'
) => () => {
  const el = ref?.current;
  if (!el) { return; }

  const handler = (event: FocusEvent) => {
    const target = type === 'focusout'
      ? event.relatedTarget
      : event.target;

    if (
      type === 'focusout'
      && (!isElement(target) || !(ref.current as HTMLElement).contains(target))
    ) {
      cb();
    } else if (
      type === 'focusin'
      && (isElement(target) && (ref.current as HTMLElement).contains(target))
    ) {
      cb();
    }
  };

  if (isEnabled) {
    return addSafeEventListener(el, type, handler);
  }
};

export const useFocusLost = (ref: React.RefObject<HTMLElement>, isEnabled: boolean, cb: () => void) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(onFocusInOrOutHandler(ref, isEnabled, cb, 'focusout'), [ref, isEnabled, cb]);
};

export const useFocusIn = (ref: React.RefObject<HTMLElement>, isEnabled: boolean, cb: () => void) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(onFocusInOrOutHandler(ref, isEnabled, cb, 'focusin'), [ref, isEnabled, cb]);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

export type OnKeyConfig = {key: string, shiftKey?: boolean};

function isKeyboardEvent(event: Event): event is KeyboardEvent {
  return 'key' in event;
}

/**
 * This function will return array where first item is a function which will set
 * event listener for given element and second item is a function which will remove
 * this listener.
 *
 * This function can be used in React class components.
 */
export const onKey = (
  config: OnKeyConfig, element: HTMLElement | Document, cb: () => void
): [() => void, () => void] => {
  const handler = (e: Event) => {
    if (isKeyboardEvent(e) && e.key === config.key &&
        (typeof config.shiftKey === 'undefined' || e.shiftKey === config.shiftKey) &&
        (!isTextInputHtmlElement(e.target))) {
      e.stopPropagation();
      cb();
    }
  };

  return [
    () => element.addEventListener('keydown', handler),
    () => element.removeEventListener('keydown', handler),
  ];
};

export const onKeyHandler = (
  config: OnKeyConfig,
  element: React.RefObject<HTMLElement> | null,
  isEnabled: boolean,
  cb: () => void
) => () => {
  const el = (element && element.current) || assertDocument();

  const [addEvListener, removeEvListener] = onKey(config, el, cb);
  if (isEnabled) {
    addEvListener();
  }

  return removeEvListener;
};

export const useOnKey = (
  config: OnKeyConfig,
  element: React.RefObject<HTMLElement> | null,
  isEnabled: boolean,
  cb: () => void
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(onKeyHandler(config, element, isEnabled, cb), [config, element, isEnabled, cb]);
};

export const onEscCallbacks: Array<() => void> = [];

// To be called by components to add an onEsc callback
// Requires the OnEsc component in the layout for normal operation
// When ESC is pressed, the last callback in the onEscCallbacks array is executed
// The callback is automatically removed when the calling component unmounts
export const useOnEsc = (isEnabled: boolean, callback: () => void) => React.useEffect(() => {
  if (!isEnabled) {
    return undefined;
  }

  onEscCallbacks.push(callback);

  return () => {
    const index = onEscCallbacks.lastIndexOf(callback);
    if (index !== -1) {
      onEscCallbacks.splice(index, 1);
    }
  };
}, [isEnabled, callback]);

const useMatchMediaQuery = (mediaQuery: string) => {
  const matchMedia = React.useMemo(
    () => assertWindow().matchMedia(mediaQuery),
    [mediaQuery]
  );
  const [matches, listener] = React.useReducer(
    (_state: unknown, e: MediaQueryListEvent) => e.matches,
    matchMedia.matches
  );

  React.useEffect(() => {
    if (typeof matchMedia.addEventListener === 'function') {
      matchMedia.addEventListener('change', listener);
    } else {
      matchMedia.addListener(listener);
    }
    return () => {
      if (typeof matchMedia.removeEventListener === 'function') {
        matchMedia.removeEventListener('change', listener);
      } else {
        matchMedia.removeListener(listener);
      }
    };
  }, [listener, matchMedia]);

  return matches;
};

export const useMatchMobileMediumQuery = () => useMatchMediaQuery(theme.breakpoints.mobileMediumQuery);
export const useMatchMobileQuery = () => useMatchMediaQuery(theme.breakpoints.mobileQuery);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(disableContentTabbingHandler(isEnabled), [isEnabled]);
};

export type KeyCombinationOptions = Partial<Pick<
  KeyboardEvent, 'altKey' | 'ctrlKey' | 'key' | 'code' | 'metaKey' | 'shiftKey'
>>;

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
  noopHandler?: (activeElement: Element) => boolean,
  preventDefault = true
) => {
  const document = assertDocument();

  const handler = React.useCallback((event: KeyboardEvent) => {
    if (noopHandler && isElement(event.target) && noopHandler(event.target)) {
      return;
    }
    if (keyboardEventMatchesCombination(options, event)) {
      if (preventDefault) event.preventDefault();
      callback(event);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, options]);

  React.useEffect(() => {
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [document, handler]);
};

export const useFocusElement = (element: React.RefObject<HTMLElement>, shouldFocus: boolean) => {
  React.useEffect(() => {
    if (shouldFocus && element.current) {
      element.current.focus();
    }
  }, [element, shouldFocus]);
};

export const useFocusHighlight = (showCard: (id: string) => void, highlights: Highlight[]) => {
  const document = assertDocument();
  React.useEffect(() => {
    if (!highlights || highlights.length === 0) return;
    const handler = (event: Event) => {
      let target: EventTarget | null;
      if (event.type === 'click') {
        if (isElement(event.target)) {
          /* 
            When clicking on a highlight, the target is a mark element and
            we need to find the first span inside it to get the highlight as expected
          */ 
          target = event.target.querySelectorAll('span')[0];
        }
      } else {
        target = event.target;
      }
      const highlight = highlights.find(h =>
        h.elements && h.elements.some(el =>
          el === target ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (!!el && typeof (el as any).contains === 'function' && (el as any).contains(target))
        )
      );

      if (highlight) {
        showCard(highlight.id);
      }
    };

    // Listen for focusin and click events to show the card
    // For some reason when focus using click, the focused element is div main-content
    document.addEventListener('focusin', handler);
    document.addEventListener('click', handler);
    return () => {
      document.removeEventListener('focusin', handler);
      document.removeEventListener('click', handler);
    };
  }, [document, highlights, showCard]);
}
export const isSSR = () => {
  return typeof window === 'undefined' || typeof document === 'undefined';
};
