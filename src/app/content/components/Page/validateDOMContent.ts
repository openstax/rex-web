import { Document, HTMLElement } from '@openstax/types/lib.dom';
import config from '../../../../config';
import { assertNotNull } from '../../../utils';

export const validateDOMContent = (_document: Document, rootEl: HTMLElement) => {
  validateLinks(rootEl);
};

const validateLinks = (rootEl: HTMLElement) => {

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

  const message = ['found invalid links in content: ', ...urls].join('\n');

  if (config.UNLIMITED_CONTENT) {
    // eslint-disable-next-line no-console
    console.warn(message);
    Array.from(rootEl.querySelectorAll('a[href^="/"]')).forEach((element) => {
      const href = assertNotNull(element.getAttribute('href'), 'href was null');
      element.setAttribute('data-broken-href', href);
      element.removeAttribute('href');
    });
  } else {
    throw new Error(message);
  }
};
