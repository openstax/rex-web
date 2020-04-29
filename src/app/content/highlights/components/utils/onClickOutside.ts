import { EventListenerOptions, HTMLElement, MouseEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { elementDescendantOf } from '../../../../domUtils';
import { assertDocument, assertWindow } from '../../../../utils';

const onClickOutside = (
  element: React.RefObject<HTMLElement>,
  isFocused: boolean,
  cb: () => void,
  eventOptions?: EventListenerOptions
) => () => {
  if (typeof document === 'undefined') {
    return () => null;
  }

  const ifOutside = (e: MouseEvent) => {
    if (!(e.target instanceof assertWindow().Element)) {
      return;
    }
    if (!element.current || elementDescendantOf(e.target, element.current)) {
      return;
    }
    cb();
  };

  if (isFocused) {
    document.addEventListener('click', ifOutside, eventOptions);
  }

  return () => assertDocument().removeEventListener('click', ifOutside, eventOptions);
};

export const useOnClickOutside = (
  element: React.RefObject<HTMLElement>,
  isEnabled: boolean,
  cb: () => void,
  eventOptions?: EventListenerOptions
) => {
  React.useEffect(onClickOutside(element, isEnabled, cb, eventOptions), [isEnabled]);
};

export default onClickOutside;
