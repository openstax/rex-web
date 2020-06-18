import { Document, HTMLElement } from '@openstax/types/lib.dom';

export const validateDOMContent = (_document: Document, rootEl: HTMLElement) => {
  validateLinks(rootEl);
};

const validateLinks = (rootEl: HTMLElement) => {
  const urls = Array.from(rootEl.querySelectorAll('a[href^="/"]'))
    .map((element) => element.getAttribute('href'));

  if (urls.length > 0) {
    throw new Error(['found invalid links in content: ', ...urls].join('\n'));
  }
};
