import { HTMLElement } from '@openstax/types/lib.dom';
import { findFirstAncestorOrSelf } from '../../../app/domUtils';
import { AppState } from '../../../app/types';
import { AnalyticsEvent, getAnalyticsRegion } from './event';

export const selector = (_: AppState) => ({});

const getElementStruct = (element: HTMLElement) => ({
  attributes: Array.from(element.attributes).reduce(
    (result, attribute) => ({...result, [attribute.name]: attribute.value}),
    {} as {[key: string]: string}
  ),
  elementType: element.tagName,
});

export const track = (
  _: ReturnType<typeof selector>,
  element: HTMLElement,
  stateChange?: string
): AnalyticsEvent | void => {
  const region = getAnalyticsRegion(element);
  const contextElement = element.parentElement && findFirstAncestorOrSelf(element.parentElement, (search) =>
    search.hasAttribute('data-type') && search.hasAttribute('id') && search.getAttribute('data-type') !== 'page'
  );

  console.log({
    contextElement: contextElement ? getElementStruct(contextElement) : undefined,
    region,
    stateChange,
    targetElement: getElementStruct(element),
  });

  return {
  };
};
