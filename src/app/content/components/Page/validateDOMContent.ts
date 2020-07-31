import { Document, HTMLElement } from '@openstax/types/lib.dom';
import { PagePropTypes } from './connector';

export const validateDOMContent = (_document: Document, rootEl: HTMLElement, pageProps: PagePropTypes) => {
  validateLinks(rootEl, pageProps.navigationQuery);
};

const validateLinks = (rootEl: HTMLElement, query: PagePropTypes['navigationQuery']) => {

  /*
   * all links in the content should be relative links to other pages
   * or fully qualified links to other things like videos or reading
   * on other sites.
   */

  const urls = Array.from(rootEl.querySelectorAll('a[href^="/"]'))
    .map((element) => element.getAttribute('href'));

  if (urls.length === 0) {
    return;
  }

  const throwOnInvalidLink = 'validateLinks' in query;
  const message = ['found invalid links in content: ', ...urls].join('\n');

  if (throwOnInvalidLink) {
    throw new Error(message);
  } else {
    // tslint:disable:no-console
    console.warn(message);
  }
};
