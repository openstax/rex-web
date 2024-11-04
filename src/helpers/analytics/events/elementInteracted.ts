import { interacted } from '@openstax/event-capture-client/events';
import { HTMLElement } from '@openstax/types/lib.dom';
import { findFirstAncestorOrSelf } from '../../../app/domUtils';
import * as selectContent from '../../../app/content/selectors';
import * as archiveTreeUtils from '../../../app/content/utils/archiveTreeUtils';
import { AnalyticsEvent, getAnalyticsRegion } from './event';

export const selector = selectContent.bookAndPage;

// helper for ts to figure out the dynamic key names
const record = <K extends string, V>(key: K, value: V) => ({[key]: value}) as Record<K, V>;

const getElementStruct = <K extends string>(name: K, element: HTMLElement) => ({
  ...record(`${name}Attributes` as const, Array.from(element.attributes).reduce(
    (result, attribute) => ({...result, [attribute.name]: attribute.value}),
    {} as {[key: string]: string}
  )),
  ...record(`${name}Type` as const, element.tagName),
  ...record(`${name}Id` as const, element.id),
});

export const track = (
  {book, page}: ReturnType<typeof selector>,
  element: HTMLElement,
  stateChange?: string
): AnalyticsEvent | void => {
  const contextRegion = getAnalyticsRegion(element) || undefined;
  const contextElement = element.parentElement && findFirstAncestorOrSelf(element.parentElement, (search) =>
    search.hasAttribute('data-type') && search.hasAttribute('id')
  );

  return book && page ? {
    getEventCapturePayload: () => interacted({
      ...getElementStruct('target', element),
      ...getElementStruct('context', contextElement || element.ownerDocument.body),
      contextRegion,
      targetStateChange: stateChange,
      sourceMetadata: {
        contentId: page.id,
        contentIndex: archiveTreeUtils.getPageIndex(book.tree, page.id),
        contentVersion: book.contentVersion,
        contextVersion: book.archiveVersion,
        scopeId: book.id,
      },
    }),
  } : {};
};
