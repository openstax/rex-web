import { Document, Element, EventListener, HTMLElement, Node, TouchEvent } from '@openstax/types/lib.dom';
import * as dom from '@openstax/types/lib.dom';
import scrollToElement from 'scroll-to-element';
import { receivePageFocus } from './actions';
import { isHtmlElement } from './guards';
import { AppServices, Store } from './types';
import { assertDefined, assertDocument, assertWindow } from './utils';
import debounce from 'lodash/debounce';

export const SCROLL_UP = 'scroll_up';
export const SCROLL_DOWN = 'scroll_down';

export const getTouchDirection = (last: TouchEvent, next: TouchEvent) =>
  next.touches[0].clientY > last.touches[0].clientY
    ? SCROLL_UP
    : next.touches[0].clientY < last.touches[0].clientY
      ? SCROLL_DOWN
      : null
;

export const getTouchScrollElement = (last: TouchEvent, next: TouchEvent) => {
  let element = isHtmlElement(next.target) ? next.target : null;
  const direction = getTouchDirection(last, next);

  if (!direction) {
    return null;
  }

  const condition = direction === SCROLL_UP
    ? elementCanScrollUp
    : elementCanScrollDown
  ;

  while (element) {
    element = findFirstScrollableParent(element);

    if (element && condition(element)) {
      return element;
    } else if (element) {
      element = element.parentElement;
    }
  }

  return assertWindow();
};

export const elementCanScrollUp = (element: HTMLElement) =>
  element.scrollTop > 0;

export const elementCanScrollDown = (element: HTMLElement) =>
  element.offsetHeight + element.scrollTop < element.scrollHeight;

export const findFirstScrollableParent = (element: HTMLElement | null): HTMLElement | null => {

  const computedStyle = (el: HTMLElement) => assertWindow().getComputedStyle(el);
  const scrollyOverflows: Array<string | null> = ['auto', 'scroll'];

  if (
    !element ||
    (
      element.scrollHeight > element.offsetHeight &&
      scrollyOverflows.includes(computedStyle(element).overflow)
    )
  ) {
    return element;
  }

  return findFirstScrollableParent(element.parentElement);
};

export const findFirstAncestorOrSelfOfType =
  <T extends {prototype: HTMLElement; new(): HTMLElement}>(node: Node, elementType: T) =>
    findFirstAncestorOrSelf(node, (el): el is T => el instanceof elementType) as T['prototype'] | void;

export const findFirstAncestorOrSelf = <T = HTMLElement>(
  node: Node,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  predicate: ((e: any) => boolean) | ((e: any) => e is T)
): T | void => {
  if (isHtmlElement(node) && predicate(node)) {
    return node as T;
  } else if (node.parentElement) {
    return findFirstAncestorOrSelf(node.parentElement, predicate);
  }
};

export const findElementSelfOrParent = (node: Node): HTMLElement | undefined => {
  if (isHtmlElement(node)) {
    return node;
  } else if (node && node.parentElement) {
    return findElementSelfOrParent(node.parentElement);
  }
};

const getScrollPadding = () => {
  const body = assertDocument().body;
  const padding = body.getAttribute('data-scroll-padding') || '0';
  return parseFloat(padding) || 0;
};

export const scrollTo = (elem: HTMLElement | Element | string) => {
  const scroll = debounce(
    () => scrollToElement(elem, {offset: getScrollPadding()}),
    100,
    {
      leading: true,
      trailing: false,
    }
  );

  document?.addEventListener(
    'load', scroll, true
  );

  setTimeout(
    () => document?.removeEventListener('load', scroll, true),
    3000
  );
  return scroll();
};

/**
 * This function will scroll into @param elementToScroll view but it will take into consideration
 * elements positions from @param otherElements.
 */
export const scrollIntoView = (elementToScroll: HTMLElement, otherElements?: HTMLElement[]) => {
  const window = assertWindow();
  if (!window.document.body.contains(elementToScroll)) { return; }

  const {top: topFirst, bottom: bottomFirst} = elementToScroll.getBoundingClientRect();

  const scrollPadding = Math.abs(getScrollPadding());
  let below = bottomFirst > window.innerHeight;
  let above = topFirst < scrollPadding;

  for (const element of otherElements || []) {
    if (window.document.body.contains(element)) {
      const { top: topEl, bottom: bottomEl } = element.getBoundingClientRect();
      below = below || bottomEl > window.innerHeight;
      above = above || topEl < scrollPadding;
    }
  }

  if (below) {
    scrollToElement(elementToScroll, {align: 'middle'});
  } else if (above) {
    scrollTo(elementToScroll);
  }
};

export const onPageFocusChange = (
  focus: boolean,
  document: Document,
  app: {services: AppServices, store: Store}
) => () => {
  app.services.analytics.pageFocus.track(app.services.analytics.pageFocus.selector(app.store.getState()), document);
  app.store.dispatch(receivePageFocus(focus));
};

const eventTypeMap = {
  focusin: 'FocusEvent' as const,
  focusout: 'FocusEvent' as const,
};
type EventTypeMap = typeof eventTypeMap;
// this ['prototype'] is only necessary because of the duplicate names in lib.dom.d.ts, if we
// change the names we can use the interface direcly here.
type EventTypeFromMap<S extends keyof EventTypeMap> = (typeof dom)[EventTypeMap[S]]['prototype'];

/*
 * typescript actually does this by default, the actual problem
 * is that our lib.dom.d.ts file is out of date and doesn't have
 * focusout in it
 */
export const addSafeEventListener = <S extends keyof EventTypeMap>(
  element: HTMLElement,
  eventString: S,
  handler: (event: EventTypeFromMap<S>) => void
) => {
  const eventType = assertDefined(
    assertWindow()[eventTypeMap[eventString]],
    'event type is not defined in eventTypeMap in /src/app/domUtils.ts'
  );

  const typeMatches = (event: dom.Event): event is EventTypeFromMap<S> => event instanceof eventType;

  const safeHandler: EventListener = (event) => {
    if (typeMatches(event)) {
      handler(event);
    }
  };

  element.addEventListener(eventString, safeHandler);
  return () => element.removeEventListener(eventString, safeHandler);
};
