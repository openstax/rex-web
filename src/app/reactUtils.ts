import { FocusEvent, HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { addSafeEventListener, elementDescendantOf } from './domUtils';
import { isElement } from './guards';

export const useDrawFocus = <E extends HTMLElement = HTMLElement>() => {
  const ref = React.useRef<E | null>(null);

  React.useEffect(() => {
    if (ref && ref.current) {
      ref.current.focus();
    }
  }, [ref]);

  return ref;
};

export const onFocusLostHandler = (ref: React.RefObject<HTMLElement>, isEnabled: boolean, cb: () => void) => () => {
  const el = ref && ref.current;
  if (!el) { return; }

  const handler = (event: FocusEvent) => {
    const relatedTarget = event.relatedTarget;

    if (!isElement(relatedTarget) || !elementDescendantOf(relatedTarget, ref.current!)) {
      cb();
    }
  };

  if (isEnabled) {
    return addSafeEventListener(el, 'focusout', handler);
  }
};

export const useFocusLost = (ref: React.RefObject<HTMLElement>, isEnabled: boolean, cb: () => void) => {
  React.useEffect(onFocusLostHandler(ref, isEnabled, cb), [ref, isEnabled]);
};
