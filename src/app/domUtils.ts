import { Element, HTMLElement, Node, TouchEvent } from '@openstax/types/lib.dom';
import scrollToElement from 'scroll-to-element';
import { isHtmlElement } from './guards';
import { assertDocument, assertWindow } from './utils';

export const SCROLL_UP: 'scroll_up' = 'scroll_up';
export const SCROLL_DOWN: 'scroll_down' = 'scroll_down';

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

export const findElementSelfOrParent = (node: Node) => {
  if (isHtmlElement(node)) {
    return node;
  } else if (node && node.parentElement) {
    return node.parentElement;
  }
};

const getScrollPadding = () => {
  const body = assertDocument().body;
  const padding = body.getAttribute('data-scroll-padding') || '0';
  return parseFloat(padding) || 0;
};

export const scrollTo = (elem: HTMLElement | Element | string) => {
  return scrollToElement(elem, {offset: getScrollPadding()});
};

export const scrollIntoView = (elem: HTMLElement) => {
  const window = assertWindow();
  const {top, bottom} = elem.getBoundingClientRect();
  const below = bottom > window.innerHeight;
  const above = top < Math.abs(getScrollPadding());

  if (below) {
    scrollToElement(elem, {align: 'middle'});
  } else if (above) {
    scrollTo(elem);
  }
};

export const elementDescendantOf = (element: Element, ancestor: Element): boolean => {
  if (element === ancestor) {
    return true;
  }
  if (!element.parentNode || !(element.parentNode instanceof assertWindow().Element)) {
    return false;
  }

  return elementDescendantOf(element.parentNode, ancestor);
};
