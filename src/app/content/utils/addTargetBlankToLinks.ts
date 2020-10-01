import { HTMLAnchorElement } from '@openstax/types/lib.dom';
import { fromRelativeUrl } from './urlUtils';

const domParser = new DOMParser();

const addTargetBlankToLinks = (htmlString: string, absolutePath: string) => {
  const domNode = domParser.parseFromString(htmlString, 'text/html');
  domNode.querySelectorAll('a').forEach((a: HTMLAnchorElement) => {
    const currentHref = a.getAttribute('href') || '';
    a.setAttribute('target', '_blank');
    a.setAttribute('href', fromRelativeUrl(currentHref, absolutePath));
  });
  return domNode.body.innerHTML;
};

export default addTargetBlankToLinks;
