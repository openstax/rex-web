import * as dom from '@openstax/types/lib.dom';
import { assertWindow } from './utils';

export const isDefined = <X>(x: X): x is Exclude<X, undefined> => x !== undefined;

type PossibleNode = {nodeType?: number; nodeName?: string};

export const isNode = (thing: unknown): thing is dom.Node =>
  typeof thing === 'object'
  && thing !== null
  && (thing as PossibleNode).nodeType === 1
  && typeof (thing as PossibleNode).nodeName === 'string'
;

export const isElement = (thing: unknown): thing is dom.Element =>
  isNode(thing)
  && (thing as {tagName?: unknown}).tagName !== undefined
;

export const isHtmlElement = (thing: unknown): thing is dom.HTMLElement =>
  isElement(thing)
  && (thing as {title?: unknown}).title !== undefined
;

const inputTypesWithoutTextInput: Array<string | null> = [
  'button', 'checkbox', 'hidden', 'image', 'radio', 'reset', 'submit',
];

const contenteditableEnabledValues: Array<string | null> = [ '', 'true' ];

export const isTextInputHtmlElement = (thing: unknown): thing is dom.HTMLElement =>
  isHtmlElement(thing) && (
    thing.tagName === 'TEXTAREA' || (
      thing.tagName === 'INPUT' && !inputTypesWithoutTextInput.includes(thing.getAttribute('type'))
    ) || contenteditableEnabledValues.includes(thing.getAttribute('contenteditable'))
  )
;

export const isPlainObject = (thing: object): thing is {} =>
  thing instanceof Object && Object.getPrototypeOf(thing).constructor === Object;

export const isWindow = (thing: unknown): thing is Window =>
  assertWindow() === thing;

export const isHtmlElementWithHighlight = (thing: unknown): thing is dom.HTMLElement =>
  isHtmlElement(thing) && thing.hasAttribute('data-highlight-id');

export const isKeyOf = <O extends {[key: string]: unknown}>(obj: O, thing: unknown): thing is keyof O =>
  typeof thing === 'string' && thing in obj;
