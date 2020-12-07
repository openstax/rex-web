import { HTMLAnchorElement } from '@openstax/types/lib.dom';
import { and, not } from '../../fpUtils';
import { fromRelativeUrl, isAbsolutePath, isAbsoluteUrl } from './urlUtils';

const domParser = new DOMParser();
const isRelativeUrl = not(and(isAbsoluteUrl, isAbsolutePath));

export function addTargetBlankToLinks(htmlString: string): string  {
  const domNode = domParser.parseFromString(htmlString, 'text/html');
  domNode.querySelectorAll('a').forEach((a: HTMLAnchorElement) => a.setAttribute('target', '_blank'));
  return domNode.body.innerHTML;
}

export const rebaseRelativeContentLinks = (htmlString: string, sourceUrl: string) => {
  const domNode = domParser.parseFromString(htmlString, 'text/html');
  domNode.querySelectorAll('a').forEach((element: HTMLAnchorElement) => {
    const hrefValue = element.getAttribute('href');
    if (hrefValue && isRelativeUrl(hrefValue)) {
      element.setAttribute('href', fromRelativeUrl(sourceUrl, hrefValue));
    }
  });
  return domNode.body.innerHTML;
};

export const resolveRelativeResources = (htmlString: string, sourceUrl: string) => {
  const domNode = domParser.parseFromString(htmlString, 'text/html');
  domNode.querySelectorAll('img,iframe').forEach((element: HTMLAnchorElement) => {
    const srcValue = element.getAttribute('src');
    if (srcValue && isRelativeUrl(srcValue)) {
      element.setAttribute('src', fromRelativeUrl(sourceUrl, srcValue));
    }
  });

  return domNode.body.innerHTML;
};
