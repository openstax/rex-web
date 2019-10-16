import { HTMLElement } from '@openstax/types/lib.dom';

export const isDefined = <X>(x: X | undefined): x is X => x !== undefined;

export const isHtmlElement = (thing: any): thing is HTMLElement =>
  typeof thing === 'object'
  && thing !== null
  && thing.nodeType === 1
  && thing.title !== undefined
  && typeof thing.nodeName === 'string'
;

export const isPlainObject = (thing: any): thing is {} =>
  thing instanceof Object && thing.__proto__.constructor === Object;
