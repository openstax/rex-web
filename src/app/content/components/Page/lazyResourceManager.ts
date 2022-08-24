import { Document } from '@openstax/types/lib.dom';
import { elementIsVisibleInWindow } from '../../../domUtils';

export const makeResourcesLazy = (document: Document) => {
  document.querySelectorAll('[src][width][height]').forEach((element) => {
    const src = element.getAttribute('src');
    if (src) {
      element.setAttribute('data-lazy-src', src);
      element.removeAttribute('src');
    }
  });
};

export const checkLazyResources = () => {
  if (typeof(window) === 'undefined')  {
    return;
  }

  window.document.querySelectorAll('[data-lazy-src]').forEach((element) => {
    if (elementIsVisibleInWindow(element)) {
      const src = element.getAttribute('data-lazy-src');
      if (src) {
        element.setAttribute('src', src);
      }
      element.removeAttribute('data-lazy-src');

    }
  });
};

export const addScrollHandler = () => {
  if (typeof(document) !== 'undefined') {
    document.addEventListener('scroll', checkLazyResources);
  }
};

export const removeScrollHandler = () => {
  if (typeof(document) !== 'undefined') {
    document.removeEventListener('scroll', checkLazyResources);
  }
};
