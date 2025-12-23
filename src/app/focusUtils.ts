/**
 * Focus Management Utilities
 *
 * This module provides React hooks and utilities for managing focus behavior
 * in the application, including:
 * - Auto-focusing elements
 * - Tab navigation trapping
 * - Focus event detection (focusin/focusout)
 * - Disabling tabbing in content areas
 * - Focus management for highlights
 *
 * These utilities help ensure proper keyboard navigation and accessibility.
 */

import type {
  Element,
  FocusEvent,
  HTMLElement,
  KeyboardEvent,
  Event,
} from '@openstax/types/lib.dom';
import React from 'react';
import { Highlight } from '@openstax/highlighter';
import { addSafeEventListener } from './domUtils';
import { isElement } from './guards';
import { assertDocument } from './utils';

/**
 * Hook that automatically focuses an element on mount.
 *
 * @template E - The type of HTML element to focus
 * @returns A ref to attach to the element that should receive focus
 *
 * @example
 * const ref = useDrawFocus<HTMLButtonElement>();
 * return <button ref={ref}>I will be auto-focused</button>;
 */
export const useDrawFocus = <E extends HTMLElement = HTMLElement>() => {
  const ref = React.useRef<E>(null);

  React.useEffect(() => {
    if (ref && ref.current) {
      ref.current.focus();
    }
  }, [ref]);

  return ref;
};

/**
 * Checks if an element is visually hidden (has zero dimensions).
 * Used to filter out elements that shouldn't be focusable.
 */
function isHidden(el: HTMLElement) {
  return el.offsetWidth === 0 && el.offsetHeight === 0;
}

/**
 * CSS selector for focusable elements in the DOM.
 * Includes buttons, inputs, links, and other interactive elements.
 * Excludes disabled elements and elements with tabindex='-1'.
 */
export const focusableItemQuery = ([
  'button',
  'input',
  'select',
  'textarea',
  '[href]',
  '[tabindex]:not([tabindex=\'-1\']',
])
  .map((s) => (s.includes('[') ? s : `${s}:not([disabled])`))
  .join(',');

/**
 * Helper function for ring buffer arithmetic.
 * Used to navigate circularly through focusable elements.
 */
function ringAdd(arr: unknown[], a: number, b: number) {
  return (arr.length + a + b) % arr.length;
}

/**
 * Creates a tab navigation trap function for one or more container elements.
 *
 * When Tab is pressed, focus will cycle through focusable elements within
 * the containers, wrapping from the last element back to the first.
 *
 * @param elements - One or more HTML elements to trap tab navigation within
 * @returns A keyboard event handler function to attach to keydown events
 *
 * @example
 * const trapTab = createTrapTab(dialogElement);
 * element.addEventListener('keydown', trapTab);
 */
export function createTrapTab(...elements: HTMLElement[]) {
  const focusableElements = elements
    .filter((c) => c && 'querySelectorAll' in c) // in some tests, this gets garbage
    .map((container) => {
      const contents = Array.from(
        container.querySelectorAll<HTMLElement>(focusableItemQuery)
      ).filter((el) => !isHidden(el));

      return {
        container,
        firstEl: contents[0],
        lastEl: contents[contents.length - 1],
      };
    })
    .filter((c) => c.firstEl);

  if (focusableElements.length === 0) {
    return () => null;
  }

  // A typical implementation, adapted for crossing multiple containers
  // e.g. https://hidde.blog/using-javascript-to-trap-focus-in-an-element/
  return (event: KeyboardEvent) => {
    if (event.key !== 'Tab') {
      return;
    }

    // Keep track of where we came from
    const startEl = document?.activeElement as HTMLElement;
    const feEntry = focusableElements.find((entry) =>
      entry.container.contains(startEl)
    );

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

/**
 * Hook that traps tab navigation within a container element.
 *
 * Useful for modal dialogs and other overlays where you want to prevent
 * the user from tabbing outside the container.
 *
 * @param ref - Reference to the container element
 * @param otherDep - Optional additional dependency to trigger re-initialization
 *                   (use when focusable elements might change)
 *
 * @example
 * const dialogRef = useRef<HTMLDivElement>(null);
 * useTrapTabNavigation(dialogRef);
 * return <div ref={dialogRef}>...</div>;
 */
export function useTrapTabNavigation(
  ref: React.MutableRefObject<HTMLElement | null>,
  otherDep?: unknown
) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el?.addEventListener) {
      return;
    }
    const trapTab = createTrapTab(el);

    el.addEventListener('keydown', trapTab, true);

    return () => el.removeEventListener('keydown', trapTab, true);
  }, [ref, otherDep]);
}

/**
 * Creates a focus event handler (focusin or focusout).
 *
 * @param ref - Reference to the element to monitor
 * @param isEnabled - Whether the handler should be active
 * @param cb - Callback to execute when focus event occurs
 * @param type - Type of focus event ('focusin' or 'focusout')
 * @returns Cleanup function to remove event listener
 */
export const onFocusInOrOutHandler =
  (
    ref: React.RefObject<HTMLElement>,
    isEnabled: boolean,
    cb: () => void,
    type: 'focusin' | 'focusout'
  ) =>
  () => {
    const el = ref?.current;
    if (!el) {
      return;
    }

    const handler = (event: FocusEvent) => {
      const target =
        type === 'focusout'
          ? (event.relatedTarget ?? event.target)
          : event.target;

      if (
        type === 'focusout' &&
        (!isElement(target) || !(ref.current as HTMLElement).contains(target))
      ) {
        cb();
      } else if (
        type === 'focusin' &&
        isElement(target) &&
        (ref.current as HTMLElement).contains(target)
      ) {
        cb();
      }
    };

    if (isEnabled) {
      return addSafeEventListener(el, type, handler);
    }
  };

/**
 * Hook that detects when focus leaves a container element.
 *
 * @param ref - Reference to the container element
 * @param isEnabled - Whether the hook should be active
 * @param cb - Callback to execute when focus is lost
 *
 * @example
 * const containerRef = useRef<HTMLDivElement>(null);
 * useFocusLost(containerRef, true, () => console.log('Focus lost!'));
 */
export const useFocusLost = (
  ref: React.RefObject<HTMLElement>,
  isEnabled: boolean,
  cb: () => void
) => {
  React.useEffect(
    () => onFocusInOrOutHandler(ref, isEnabled, cb, 'focusout')(),
    [ref, isEnabled, cb]
  );
};

/**
 * Hook that detects when focus enters a container element.
 *
 * @param ref - Reference to the container element
 * @param isEnabled - Whether the hook should be active
 * @param cb - Callback to execute when focus enters
 *
 * @example
 * const containerRef = useRef<HTMLDivElement>(null);
 * useFocusIn(containerRef, true, () => console.log('Focus gained!'));
 */
export const useFocusIn = (
  ref: React.RefObject<HTMLElement>,
  isEnabled: boolean,
  cb: () => void
) => {
  React.useEffect(
    () => onFocusInOrOutHandler(ref, isEnabled, cb, 'focusin')(),
    [ref, isEnabled, cb]
  );
};

/**
 * CSS selector for tabbable elements in the DOM.
 * Based on https://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus/30753870#30753870
 * and https://allyjs.io/data-tables/focusable.html
 */
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
]
  .map((el) => el + `:not([tabindex='-1'])`)
  .join(',');

/**
 * Disables tab navigation for all content in the #root element.
 *
 * This is useful when showing modal overlays where you want to prevent
 * users from tabbing to content behind the modal.
 *
 * @param isEnabled - Whether to disable tabbing
 * @returns Cleanup function to restore original tab indices
 */
export const disableContentTabbingHandler = (isEnabled: boolean) => () => {
  if (!isEnabled) {
    return;
  }
  const root = assertDocument().querySelector('#root');
  if (!root) {
    return;
  }

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

/**
 * Hook that disables tab navigation for content elements.
 *
 * @param isEnabled - Whether to disable tabbing
 *
 * @example
 * useDisableContentTabbing(modalIsOpen);
 */
export const useDisableContentTabbing = (isEnabled: boolean) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(disableContentTabbingHandler(isEnabled), [isEnabled]);
};

/**
 * Hook that focuses an element when a condition is met.
 *
 * @param element - Reference to the element to focus
 * @param shouldFocus - Whether the element should be focused
 *
 * @example
 * const inputRef = useRef<HTMLInputElement>(null);
 * useFocusElement(inputRef, dialogIsOpen);
 */
export const useFocusElement = (
  element: React.RefObject<HTMLElement>,
  shouldFocus: boolean
) => {
  React.useEffect(() => {
    if (shouldFocus && element.current) {
      element.current.focus();
    }
  }, [element, shouldFocus]);
};

/**
 * Hook that manages focus behavior for highlights.
 *
 * Listens for focusin and click events on highlight elements and calls
 * the showCard callback with the highlight ID when a highlight is focused or clicked.
 *
 * @param showCard - Callback function that receives the highlight ID
 * @param highlights - Array of highlight objects to monitor
 *
 * @example
 * useFocusHighlight((id) => setActiveHighlight(id), highlights);
 */
export const useFocusHighlight = (
  showCard: (id: string) => void,
  highlights: Highlight[]
) => {
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
          target = event.target.querySelector('span');
        }
      } else {
        target = event.target;
      }
      const highlight = highlights.find(
        (h) =>
          h.elements &&
          (h.elements as Element[]).some(
            (el) =>
              el === target ||
              (!!el &&
                typeof el.contains === 'function' &&
                el.contains(target as Element))
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
};
