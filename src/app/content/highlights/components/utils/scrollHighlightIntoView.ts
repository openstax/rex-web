import { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import { scrollIntoView } from '../../../../domUtils';

export default (highlight: Highlight, element?: HTMLElement | null) => {
  const firstElement = highlight.elements[0] as HTMLElement;
  const lastElement = highlight.elements[highlight.elements.length - 1] as HTMLElement;
  const otherElements = [lastElement];
  if (element) {
    otherElements.push(element);
  }
  scrollIntoView(firstElement, otherElements);
};
