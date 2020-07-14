import { Element, EventListenerOptions, HTMLElement, MouseEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { isHtmlElement } from '../../../../guards';
import { assertDocument, assertWindow } from '../../../../utils';

const onClickOutside = (
  element: React.RefObject<HTMLElement> | Array<React.RefObject<HTMLElement> | HTMLElement>,
  isEnabled: boolean,
  cb: (ev: MouseEvent) => void,
  eventOptions?: EventListenerOptions
) => () => {
  if (typeof document === 'undefined') {
    return () => null;
  }

  const ifOutside = (e: MouseEvent) => {
    if (!(e.target instanceof assertWindow().Element)) {
      return;
    }
    if (Array.isArray(element)) {
      const targetBelongsToElementList = element.some(
        (el) => isHtmlElement(el)
          ? el.contains(e.target as Element)
          : el.current && el.current.contains(e.target as Element));
      if (targetBelongsToElementList) { return; }
    } else if (!Array.isArray(element) && (!element.current || element.current.contains(e.target))) {
      return;
    }
    cb(e);
  };

  if (isEnabled) {
    document.addEventListener('click', ifOutside, eventOptions);
  }

  return () => assertDocument().removeEventListener('click', ifOutside, eventOptions);
};

export const useOnClickOutside = (
  element: React.RefObject<HTMLElement> | Array<React.RefObject<HTMLElement> | HTMLElement>,
  isEnabled: boolean,
  cb: (e: MouseEvent) => void,
  eventOptions?: EventListenerOptions
) => {
  React.useEffect(onClickOutside(element, isEnabled, cb, eventOptions), [element, cb, isEnabled]);
};

export default onClickOutside;

const isRefWithHtmlElement = (el: any): el is React.RefObject<HTMLElement> => {
  return el instanceof Object && isHtmlElement(el.current);
};

export const isElementForOnClickOutside = (el: any): el is HTMLElement | React.RefObject<HTMLElement> => {
  return isHtmlElement(el) || isRefWithHtmlElement(el);
};
