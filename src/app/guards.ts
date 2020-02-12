import * as dom from '@openstax/types/lib.dom';

export const isDefined = <X>(x: X): x is Exclude<X, undefined> => x !== undefined;

export const isNode = (thing: any): thing is dom.Node =>
  typeof thing === 'object'
  && thing !== null
  && thing.nodeType === 1
  && typeof thing.nodeName === 'string'
;

export const isElement = (thing: any): thing is dom.Element =>
  isNode(thing)
  && (thing as any).tagName !== undefined
;

export const isHtmlElement = (thing: any): thing is dom.HTMLElement =>
  isElement(thing)
  && (thing as any).title !== undefined
;

export const isPlainObject = (thing: any): thing is {} =>
  thing instanceof Object && thing.__proto__.constructor === Object;
