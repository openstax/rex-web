/**
 * Keyboard Event Utilities
 *
 * This module provides React hooks and utilities for handling keyboard events,
 * including:
 * - Single key press detection (with shift modifier support)
 * - Key combination detection (Ctrl+Key, Alt+Key, etc.)
 * - Escape key handling with callback stack
 * - Preventing keyboard events in text input elements
 *
 * These utilities help implement keyboard shortcuts and navigation.
 */

import type { Document, Element, Event, HTMLElement, KeyboardEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { isTextInputHtmlElement } from './guards';
import { assertDocument } from './utils';

/**
 * Configuration for single key press detection.
 */
export type OnKeyConfig = {key: string, shiftKey?: boolean};

/**
 * Type guard to check if an event is a KeyboardEvent.
 */
function isKeyboardEvent(event: Event): event is KeyboardEvent {
  return 'key' in event;
}

/**
 * Creates event listeners for a specific key press.
 *
 * This function can be used in React class components or imperative code.
 * Returns a tuple of [addListener, removeListener] functions.
 *
 * @param config - Key configuration (key name and optional shift key requirement)
 * @param element - Element or document to attach the listener to
 * @param cb - Callback to execute when the key is pressed
 * @returns Tuple of [addListener, removeListener] functions
 *
 * @example
 * const [addListener, removeListener] = onKey(
 *   { key: 'Enter' },
 *   document,
 *   () => console.log('Enter pressed!')
 * );
 * addListener();
 * // ... later ...
 * removeListener();
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

/**
 * Creates a key event handler for use in React hooks.
 *
 * @param config - Key configuration
 * @param element - Reference to element (or null to use document)
 * @param isEnabled - Whether the handler should be active
 * @param cb - Callback to execute when key is pressed
 * @returns Cleanup function
 */
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

/**
 * Hook that listens for a specific key press.
 *
 * @param config - Key configuration (key name and optional shift key requirement)
 * @param element - Reference to element (or null to use document)
 * @param isEnabled - Whether the hook should be active
 * @param cb - Callback to execute when key is pressed
 *
 * @example
 * useOnKey(
 *   { key: 'Enter', shiftKey: true },
 *   null,
 *   true,
 *   () => console.log('Shift+Enter pressed!')
 * );
 */
export const useOnKey = (
  config: OnKeyConfig,
  element: React.RefObject<HTMLElement> | null,
  isEnabled: boolean,
  cb: () => void
) => {
  React.useEffect(() => onKeyHandler(config, element, isEnabled, cb)(), [config, element, isEnabled, cb]);
};

/**
 * Stack of Escape key callbacks.
 *
 * When ESC is pressed, the last callback in this array is executed.
 * Requires the OnEsc component in the layout for normal operation.
 *
 * @internal
 */
export const onEscCallbacks: Array<() => void> = [];

/**
 * Hook that registers a callback for the Escape key.
 *
 * When ESC is pressed, the most recently registered callback is executed first
 * (LIFO order). This allows nested components like modals to close in the
 * correct order.
 *
 * The callback is automatically removed when the component unmounts.
 *
 * @param isEnabled - Whether the hook should be active
 * @param callback - Function to call when Escape is pressed
 *
 * @example
 * useOnEsc(modalIsOpen, () => setModalIsOpen(false));
 */
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

/**
 * Options for key combination detection.
 * Supports Alt, Ctrl, Meta (Command), Shift, plus the main key or key code.
 */
export type KeyCombinationOptions = Partial<Pick<
  KeyboardEvent, 'altKey' | 'ctrlKey' | 'key' | 'code' | 'metaKey' | 'shiftKey'
>>;

/**
 * Checks if a keyboard event matches the specified key combination.
 *
 * Compares each property in options with the corresponding property in the event.
 * String values are compared case-insensitively.
 *
 * @param options - Key combination to match
 * @param event - Keyboard event to check
 * @returns True if the event matches all specified options
 *
 * @example
 * const isSaveShortcut = keyboardEventMatchesCombination(
 *   { ctrlKey: true, key: 's' },
 *   event
 * ); // Matches Ctrl+S
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
 * Hook that listens for a specific key combination.
 *
 * Attaches a keydown event listener to the document and checks if the pressed keys
 * match the specified combination (e.g., Ctrl+S, Alt+F, Cmd+K).
 *
 * @param options - Key combination to listen for
 * @param callback - Function to call when the combination is pressed
 * @param noopHandler - Optional function to check if the event should be ignored
 *                      (e.g., when focus is in a text input). Returns true to ignore.
 * @param preventDefault - Whether to prevent the default browser action (default: true)
 *
 * @example
 * // Listen for Ctrl+S to save
 * useKeyCombination(
 *   { ctrlKey: true, key: 's' },
 *   () => saveDocument(),
 *   (target) => target.tagName === 'TEXTAREA', // Don't trigger in textareas
 *   true
 * );
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
  }, [callback, noopHandler, options, preventDefault]);

  React.useEffect(() => {
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [document, handler]);
};

/**
 * Type guard to check if an object is an Element.
 * Re-exported from guards module for internal use.
 */
function isElement(target: EventTarget | null): target is Element {
  return target !== null && 'tagName' in target;
}
