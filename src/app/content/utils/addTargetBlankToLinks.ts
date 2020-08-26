import { HTMLAnchorElement } from '@openstax/types/lib.dom';

const domParser = new DOMParser();

const addTargetBlankToLinks = (htmlString: string) => {
  const domNode = domParser.parseFromString(htmlString, 'text/html');
  domNode.querySelectorAll('a').forEach((a: HTMLAnchorElement) => a.setAttribute('target', '_blank'));
  return domNode.body.innerHTML;
};

export default addTargetBlankToLinks;
