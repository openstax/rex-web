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
import { addSafeEventListener } from '../domUtils';
import { isElement } from '../guards';
import { assertDocument } from '../utils';

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

// Ring buffer arithmetic for circular navigation
function ringAdd(arr: unknown[], a: number, b: number) {
  return (arr.length + a + b) % arr.length;
}

// Creates a tab navigation trap that cycles focus within container elements
// Based on https://hidde.blog/using-javascript-to-trap-focus-in-an-element/
export function createTrapTab(...elements: HTMLElement[]) {
  const containers = elements
    .filter((c) => c && 'querySelectorAll' in c); // in some tests, this gets garbage

  if (containers.length === 0) {
    return () => null;
  }

  function queryFocusable() {
    return containers
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
  }

  return (event: KeyboardEvent) => {
    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = queryFocusable();

    if (focusableElements.length === 0) {
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

// Supply otherDep when focusable elements might change (see EditCard)
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
