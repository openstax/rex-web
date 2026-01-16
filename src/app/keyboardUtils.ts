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

export type OnKeyConfig = {key: string, shiftKey?: boolean};

function isKeyboardEvent(event: Event): event is KeyboardEvent {
  return 'key' in event;
}

// Can be used in React class components
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
  React.useEffect(() => onKeyHandler(config, element, isEnabled, cb)(), [config, element, isEnabled, cb]);
};

// Requires the OnEsc component in the layout
// When ESC is pressed, the last callback in this array is executed (LIFO)
export const onEscCallbacks: Array<() => void> = [];

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

export type KeyCombinationOptions = Partial<Pick<
  KeyboardEvent, 'altKey' | 'ctrlKey' | 'key' | 'code' | 'metaKey' | 'shiftKey'
>>;

// String values are compared case-insensitively
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

// noopHandler returns true to ignore the event (e.g., when focus is in a text input)
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

function isElement(target: EventTarget | null): target is Element {
  return target !== null && 'tagName' in target;
}
