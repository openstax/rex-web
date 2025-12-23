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
import { isWindow } from './guards';
import { assertDefined } from './utils';

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

/**
 * Creates a handler for DOM events on an element or window.
 *
 * @param element - Reference to element or the window object
 * @param isEnabled - Whether the handler should be active
 * @param event - Name of the DOM event to listen for
 * @param cb - Callback to execute when event fires
 * @returns Cleanup function to remove event listener
 */
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

/**
 * Hook that listens for a DOM event on an element or window.
 *
 * @param element - Reference to element or the window object
 * @param isEnabled - Whether the hook should be active
 * @param event - Name of the DOM event to listen for
 * @param cb - Callback to execute when event fires
 * @param deps - Additional dependencies for the effect
 *
 * @example
 * useOnDOMEvent(window, true, 'resize', handleResize);
 */
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

/**
 * Hook that sets up a timeout that can be reset.
 *
 * The timeout automatically starts when the component mounts and can be
 * reset by calling the returned reset function. The timeout is automatically
 * cleared when the component unmounts.
 *
 * @param delay - Timeout delay in milliseconds
 * @param callback - Function to call when timeout expires
 * @returns Reset function to restart the timeout
 *
 * @example
 * const resetTimer = useTimeout(5000, () => console.log('Time expired!'));
 * // Later: resetTimer() to restart the 5-second countdown
 */
export const useTimeout = (delay: number, callback: () => void) => {
  const savedCallback = React.useRef<typeof callback>();
  const timeout = React.useRef<number>();

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

/**
 * Checks if the code is running in a server-side rendering environment.
 *
 * @returns True if running on the server (no window or document), false if in browser
 *
 * @example
 * if (isSSR()) {
 *   // Skip browser-only code during server rendering
 *   return null;
 * }
 */
export const isSSR = () => {
  return typeof window === 'undefined' || typeof document === 'undefined';
};
