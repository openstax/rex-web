import { EventListenerOptions, HTMLElement, MouseEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { elementDescendantOf } from '../../../../domUtils';
import { assertDocument, assertWindow } from '../../../../utils';

const onClickOutside = (
  element: React.RefObject<HTMLElement>,
  isFocused: boolean,
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
    if (!element.current || elementDescendantOf(e.target, element.current)) {
      return;
    }
    cb(e);
  };

  if (isFocused) {
    document.addEventListener('click', ifOutside, eventOptions);
  }

  return () => assertDocument().removeEventListener('click', ifOutside, eventOptions);
};

export const useOnClickOutside = (
  element: React.RefObject<HTMLElement>,
  isEnabled: boolean,
  cb: (e: MouseEvent) => void,
  eventOptions?: EventListenerOptions,
  deps?: any[]
) => {
  React.useEffect(onClickOutside(element, isEnabled, cb, eventOptions), [isEnabled, ...deps || []]);
};

export default onClickOutside;
