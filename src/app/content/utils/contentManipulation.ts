import { HTMLAnchorElement } from '@openstax/types/lib.dom';
import { fromRelativeUrl } from './urlUtils';

const domParser = new DOMParser();

export function addTargetBlankToLinks(htmlString: string): string  {
  const domNode = domParser.parseFromString(htmlString, 'text/html');
  domNode.querySelectorAll('a').forEach((a: HTMLAnchorElement) => a.setAttribute('target', '_blank'));
  return domNode.body.innerHTML;
}

export const isAbsoluteUrl = (url: string) => {
  const pattern = /^((https?:)?\/)?\//i;
  const aux = pattern.test(url);
  return aux;
};

export function fixRelativeURLs(htmlString: string, sourceUrl?: string): string {
  const domNode = domParser.parseFromString(htmlString, 'text/html');
  domNode.querySelectorAll('a').forEach((a: HTMLAnchorElement) => {
    const hrefValue = a.getAttribute('href');
    if (hrefValue && !isAbsoluteUrl(hrefValue) && sourceUrl) {
      a.setAttribute('href', fromRelativeUrl(sourceUrl, hrefValue));
    }
  });
  return domNode.body.innerHTML;
}
