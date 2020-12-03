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

export const rebaseRelativeContentLinks = (htmlString: string, sourceUrl: string) => {
  const domNode = domParser.parseFromString(htmlString, 'text/html');
  domNode.querySelectorAll('a').forEach((element: HTMLAnchorElement) => {
    const hrefValue = element.getAttribute('href');
    if (hrefValue && !isAbsoluteUrl(hrefValue) && sourceUrl) {
      element.setAttribute('href', fromRelativeUrl(sourceUrl, hrefValue));
    }
  });
  return domNode.body.innerHTML;
};

export const rebaseRelativeResources = (htmlString: string, sourceUrl: string) => {
  const domNode = domParser.parseFromString(htmlString, 'text/html');
  domNode.querySelectorAll('img,iframe').forEach((element: HTMLAnchorElement) => {
    const srcValue = element.getAttribute('src');
    if (srcValue && !isAbsoluteUrl(srcValue) && sourceUrl) {
      element.setAttribute('src', fromRelativeUrl(sourceUrl, srcValue));
    }
  });

  return domNode.body.innerHTML;
};
