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
  Range,
} from '@openstax/types/lib.dom';
import React from 'react';
import { Highlight } from '@openstax/highlighter';
import { addSafeEventListener } from '../domUtils';
import { isElement } from '../guards';
import { assertDocument, assertWindow } from '../utils';

export const useDrawFocus = <E extends HTMLElement = HTMLElement>() => {
  const ref = React.useRef<E>(null);

  React.useEffect(() => {
    if (ref && ref.current) {
      ref.current.focus();
    }
  }, [ref]);

  return ref;
};

export const focusableItemQuery = ([
  'button',
  'input',
  'select',
  'textarea',
  '[href]',
  '[tabindex]:not([tabindex=\'-1\'])',
])
  .map((s) => (s.includes('[') ? s : `${s}:not([disabled])`))
  .join(',');

// Ring buffer arithmetic for circular navigation
function ringAdd(arr: unknown[], a: number, b: number) {
  return (arr.length + a + b) % arr.length;
}

// Helper type for focusable element entries
interface FocusableEntry {
  container: HTMLElement;
  firstEl: HTMLElement;
  lastEl: HTMLElement;
  allElements: HTMLElement[];
}

// Saves the current text selection for later restoration (important for Firefox)
function saveTextSelection(win: Window): Range | null {
  const selection = win.getSelection();
  return selection && selection.rangeCount > 0
    ? selection.getRangeAt(0).cloneRange()
    : null;
}

// Input types with no text caret. Listed as exclusions rather than listing the text-capable types
// because an input with a missing or unrecognised type falls back to type=text, so defaulting to
// "has a caret" is the safe direction. This matters for the edit card: ColorPicker focuses a radio
// input, and treating that as a caret field would drop the selection the caller is preserving.
const caretlessInputSelector = [
  'button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit',
]
  .map((type) => `input[type='${type}']`)
  .join(',');

const holdsTextCaret = (el: HTMLElement) =>
  el.tagName === 'TEXTAREA'
  || el.isContentEditable
  || (el.tagName === 'INPUT' && !el.matches(caretlessInputSelector));

// Restores a previously saved text selection
function restoreTextSelection(win: Window, savedRange: Range | null): void {
  if (!savedRange) {
    return;
  }

  // Don't write a document selection while a field with a text caret is focused: it deactivates
  // the caret, so the field keeps its focus ring but won't accept typing until it's clicked.
  const active = win.document.activeElement as HTMLElement | null;
  if (active && holdsTextCaret(active)) {
    return;
  }

  try {
    const sel = win.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange);
    }
  } catch (e) {
    // Ignore restoration errors
  }
}

// Schedules selection restoration after browser processes Tab event
function scheduleSelectionRestoration(win: Window, restoreFn: () => void): void {
  if (typeof win.requestAnimationFrame === 'function') {
    win.requestAnimationFrame(restoreFn);
  } else {
    win.setTimeout(restoreFn, 0);
  }
}

// Runs a focus-moving callback while preserving the current text selection. Moving focus into a
// control can collapse an active selection in some browsers (notably Firefox); this saves the range
// and restores it afterwards, so Tab-routing can focus the card without losing a pending selection.
export function withSelectionPreserved(fn: () => void): void {
  const win = assertWindow();
  const savedRange = safeSaveTextSelection(win);
  fn();
  restoreTextSelection(win, savedRange);
}

// Determines the next focus element when Tab wraps around
function getNextWrapElement(
  currentIndex: number,
  isShiftKey: boolean,
  focusableElements: FocusableEntry[],
  currentEntry: FocusableEntry
): { nextElement: HTMLElement | null; shouldPreventDefault: boolean } {
  if (isShiftKey) {
    if (currentIndex <= 0) {
      // At or before first element, wrap to last
      const feIdx = focusableElements.indexOf(currentEntry);
      const newIdx = ringAdd(focusableElements, feIdx, -1);
      return {
        nextElement: focusableElements[newIdx].lastEl,
        shouldPreventDefault: true,
      };
    }
  } else {
    if (currentIndex >= currentEntry.allElements.length - 1) {
      // At or after last element, wrap to first
      const feIdx = focusableElements.indexOf(currentEntry);
      const newIdx = ringAdd(focusableElements, feIdx, 1);
      return {
        nextElement: focusableElements[newIdx].firstEl,
        shouldPreventDefault: true,
      };
    }
  }
  return { nextElement: null, shouldPreventDefault: false };
}

// Query focusable elements within containers
function queryFocusableInContainers(containers: HTMLElement[]): FocusableEntry[] {
  return containers
    .map((container) => {
      const contents = Array.from(
        container.querySelectorAll<HTMLElement>(focusableItemQuery)
      );

      return {
        container,
        firstEl: contents[0],
        lastEl: contents[contents.length - 1],
        allElements: contents,
      };
    })
    .filter((c) => c.firstEl);
}

// Safely saves the current text selection, returning null if unavailable
function safeSaveTextSelection(win: Window): Range | null {
  try {
    return saveTextSelection(win);
  } catch (e) {
    // Selection API unavailable or restricted context
    return null;
  }
}

// Creates a tab navigation trap that cycles focus within container elements
// Based on https://hidde.blog/using-javascript-to-trap-focus-in-an-element/
// IMPORTANT: Preserves text selection on Firefox when Tab navigation occurs
export function createTrapTab(...elements: HTMLElement[]) {
  const containers = elements
    .filter((c) => c && 'querySelectorAll' in c); // in some tests, this gets garbage

  if (containers.length === 0) {
    return () => null;
  }

  const win = assertWindow();

  return (event: KeyboardEvent) => {
    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = queryFocusableInContainers(containers);

    if (focusableElements.length === 0) {
      return;
    }

    const savedRange = safeSaveTextSelection(win);
    const restoreSelection = () => restoreTextSelection(win, savedRange);

    // Keep track of where we came from
    const startEl = document?.activeElement as HTMLElement;
    const feEntry = focusableElements.find((entry) =>
      entry.container.contains(startEl)
    );

    // Focus has escaped the trap
    if (!feEntry) {
      focusableElements[0].firstEl.focus();
      event.preventDefault();
      restoreSelection();
      return;
    }

    // Check if we need to wrap around (focus is at a boundary)
    const currentIndex = feEntry.allElements.indexOf(startEl);
    const { nextElement, shouldPreventDefault } = getNextWrapElement(
      currentIndex,
      event.shiftKey,
      focusableElements,
      feEntry
    );

    // If we're wrapping around, handle focus and restore selection
    if (nextElement && shouldPreventDefault) {
      nextElement.focus();
      event.preventDefault();
      restoreSelection();
      return;
    }

    // For normal Tab navigation within the same container,
    // let the browser handle it but restore selection after
    scheduleSelectionRestoration(win, restoreSelection);
  };
}

// Focuses the first focusable element while preserving text selection
// Used for modals/overlays that need initial focus but preserve user's text selection
function autoFocusFirstElement(el: HTMLElement): void {
  const win = assertWindow();
  const savedRange = safeSaveTextSelection(win);

  const focusableElements = Array.from(
    el.querySelectorAll<HTMLElement>(focusableItemQuery)
  );

  if (focusableElements.length > 0) {
    const currentFocus = assertDocument().activeElement;
    const isElementFocused = currentFocus && el.contains(currentFocus);

    if (!isElementFocused) {
      focusableElements[0].focus();
      restoreTextSelection(win, savedRange);
    }
  }
}

// Supply otherDep when focusable elements might change (see EditCard)
// Set autoFocus=true to focus the first focusable element on mount (useful for modals/overlays)
// Set isEnabled=false to leave the trap detached (e.g. so focus can be routed out of the card
// while it is not actively being edited)
export function useTrapTabNavigation(
  ref: React.MutableRefObject<HTMLElement | null>,
  otherDep?: unknown,
  autoFocus?: boolean,
  isEnabled = true
) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el?.addEventListener || !isEnabled) {
      return;
    }

    // Auto-focus first element if requested (for modals/overlays)
    if (autoFocus) {
      try {
        autoFocusFirstElement(el);
      } catch (e) {
        // Ignore errors in SSR or when window is not available
      }
    }

    const trapTab = createTrapTab(el);

    el.addEventListener('keydown', trapTab, true);

    return () => el.removeEventListener('keydown', trapTab, true);
  }, [ref, otherDep, autoFocus, isEnabled]);
}

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

// Based on https://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus/30753870#30753870
// and https://allyjs.io/data-tables/focusable.html
export const tabbableElementsSelector = [
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

// tabbableElementsSelector is intentionally broad: its job is to strip tabbability from
// everything behind a modal, so it matches elements that are not themselves tab stops (`ol` is
// there for Firefox's scrollable containers, `object`/`embed` never take Tab) and, being a
// selector, it also matches controls that CSS has hidden. focus() on any of those is a no-op, so
// code that picks a Tab target from that list, prevents the native Tab, and then focuses its
// pick can leave focus on nothing - i.e. on <body>. Use isTabbable to narrow such a list to
// elements focus() will actually move to.

// Elements that take Tab focus by virtue of their tag. Any element with a non-negative tabindex
// is also a tab stop, whatever its tag, so that is handled separately in isTabbable.
const nativeTabStopSelector = [
  'a[href]',
  'area[href]',
  'audio[controls]',
  'button',
  'iframe',
  'input:not([type=\'hidden\'])',
  'select',
  'summary',
  'textarea',
  'video[controls]',
  '[contentEditable=true]',
]
  .map((el) => el + ':not([disabled])')
  .join(',');

// A closed <details> shows only its summary and hides the rest, but it does so without changing
// those descendants' own computed styles (the UA hides the content slot / ::details-content), so
// a style walk cannot see it while focus() still refuses them. This is on the Tab path in REX:
// wrapSolutions() puts every exercise solution - links and all - inside a closed <details>.
const isHiddenInClosedDetails = (el: HTMLElement): boolean => {
  let child: HTMLElement = el;

  for (let node = el.parentElement; node; child = node, node = node.parentElement) {
    if (node.tagName.toLowerCase() !== 'details' || node.hasAttribute('open')) {
      continue;
    }
    // Only the first direct summary is the disclosure widget, and it stays visible/focusable;
    // everything else under a closed details is hidden, including any later summary.
    const disclosureSummary = Array.from(node.children).find(
      (candidate) => candidate.tagName.toLowerCase() === 'summary'
    );
    if (child !== disclosureSummary) {
      return true;
    }
  }

  return false;
};

// display: none (on the element or any ancestor) and visibility: hidden both make an element
// unfocusable. Deliberately style-based rather than layout-based (getClientRects/offsetParent) so
// that it gives the same answer under jsdom, which has no layout.
export const isRenderedForFocus = (el: HTMLElement): boolean => {
  const window = assertWindow();

  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    const style = window.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }
  }

  return el.isConnected && !isHiddenInClosedDetails(el);
};

// Things focus() always refuses, whatever the tabindex says: a disabled form control, and an
// input that has no rendered box of its own. tabbableElementsSelector reaches both through its
// generic `[tabindex]` arm.
const neverFocusableSelector = [
  'button[disabled]',
  'input[disabled]',
  'select[disabled]',
  'textarea[disabled]',
  'fieldset[disabled]',
  'optgroup[disabled]',
  'option[disabled]',
  'input[type=\'hidden\']',
].join(',');

// Whether focus() on this element would actually move focus to it.
export const isTabbable = (el: HTMLElement): boolean => {
  if (el.matches(neverFocusableSelector)) {
    return false;
  }

  const tabIndex = el.getAttribute('tabindex');
  const takesFocus = tabIndex === null
    ? el.matches(nativeTabStopSelector)
    : Number(tabIndex) >= 0;

  return takesFocus && isRenderedForFocus(el);
};

// Disables tabbing to content behind modals
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

export const useDisableContentTabbing = (isEnabled: boolean) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(disableContentTabbingHandler(isEnabled), [isEnabled]);
};

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
