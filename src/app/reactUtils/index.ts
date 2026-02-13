/**
 * React Utilities
 *
 * This file serves as a barrel export for React utility hooks and functions.
 * The utilities have been organized into focused modules by responsibility:
 *
 * - focusUtils.ts - Focus management and tab navigation
 * - keyboardUtils.ts - Keyboard event handling and shortcuts
 * - mediaQueryUtils.ts - Media queries and responsive design
 * - scrollUtils.ts - Scroll event monitoring
 *
 * This file also contains general-purpose utilities that don't fit into
 * the above categories (DOM events, timeouts, SSR detection).
 */

import type { HTMLElement, HTMLElementEventMap } from '@openstax/types/lib.dom';
import React from 'react';
import { isWindow } from '../guards';
import { assertDefined } from '../utils';

// Re-export all focus-related utilities
export {
  useDrawFocus,
  focusableItemQuery,
  createTrapTab,
  useTrapTabNavigation,
  onFocusInOrOutHandler,
  useFocusLost,
  useFocusIn,
  disableContentTabbingHandler,
  useDisableContentTabbing,
  useFocusElement,
  useFocusHighlight,
} from './focusUtils';

// Re-export all keyboard-related utilities
export type {
  OnKeyConfig,
  KeyCombinationOptions,
} from './keyboardUtils';

export {
  onKey,
  onKeyHandler,
  useOnKey,
  onEscCallbacks,
  useOnEsc,
  keyboardEventMatchesCombination,
  useKeyCombination,
} from './keyboardUtils';

// Re-export all media query utilities
export {
  useMatchMobileMediumQuery,
  useMatchMobileQuery,
  useDebouncedWindowSize,
} from './mediaQueryUtils';

// Re-export all scroll utilities
export {
  useOnScrollTopOffset,
} from './scrollUtils';

// ============================================================================
// General DOM Event Utilities
// ============================================================================

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

// ============================================================================
// Timeout Utilities
// ============================================================================

export const useTimeout = (delay: number, callback: () => void) => {
  const savedCallback = React.useRef<typeof callback>();
  const timeout = React.useRef<ReturnType<typeof setTimeout>>();

  const timeoutHandler = () => savedCallback.current && savedCallback.current();
  const reset = React.useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(timeoutHandler, delay);
  }, [delay]);

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
      reset();
  }, [reset]);

  React.useEffect(() => () => clearTimeout(assertDefined(timeout.current, 'timeout ID can\'t be undefined')), []);

  return reset;
};

// ============================================================================
// SSR Detection
// ============================================================================

export const isSSR = () => {
  return typeof window === 'undefined' || typeof document === 'undefined';
};
