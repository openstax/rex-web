import { EventListener, HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { elementDescendantOf } from './domUtils';
import { assertWindow } from './utils';

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

  const handler: EventListener = (event) => {
    if (!(event instanceof assertWindow().FocusEvent)) {
      return;
    }
    const relatedTarget = event.relatedTarget as HTMLElement | null;

    if (!relatedTarget || !elementDescendantOf(relatedTarget, ref.current!)) {
      cb();
    }
  };

  if (isEnabled) {
    el.addEventListener('focusout', handler);
  }

  return () => el.removeEventListener('focusout', handler);
};

export const useFocusLost = (ref: React.RefObject<HTMLElement>, isEnabled: boolean, cb: () => void) => {
  React.useEffect(onFocusLostHandler(ref, isEnabled, cb), [ref, isEnabled]);
};
