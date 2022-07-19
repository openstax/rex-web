import * as dom from '@openstax/types/lib.dom';
import { assertWindow } from './utils';

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

const inputTypesWithoutTextInput: Array<string | null> = [
  'button', 'checkbox', 'hidden', 'image', 'radio', 'reset', 'submit',
];

const contenteditableEnabledValues: Array<string | null> = [ '', 'true' ];

export const isTextInputHtmlElement = (thing: any): thing is dom.HTMLElement =>
  isHtmlElement(thing) && (
    thing.tagName === 'TEXTAREA' || (
      thing.tagName === 'INPUT' && !inputTypesWithoutTextInput.includes(thing.getAttribute('type'))
    ) || contenteditableEnabledValues.includes(thing.getAttribute('contenteditable'))
  )
;

export const isPlainObject = (thing: any): thing is {} =>
  thing instanceof Object && thing.__proto__.constructor === Object;

export const isWindow = (thing: any): thing is Window =>
  assertWindow() === thing;

export const isHtmlElementWithHighlight = (thing: any): thing is dom.HTMLElement =>
  isHtmlElement(thing) && thing.hasAttribute('data-highlight-id');
