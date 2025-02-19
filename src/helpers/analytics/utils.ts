import {
  Event,
  HTMLAnchorElement,
  HTMLButtonElement,
  HTMLDetailsElement,
  HTMLElement,
  HTMLIFrameElement,
} from '@openstax/types/lib.dom';
import Cookies from 'js-cookie';
import { findFirstAncestorOrSelf } from '../../app/domUtils';
import { isHtmlElement, isNode, isWindow } from '../../app/guards';
import { UnionToIntersection } from '../../app/types';
import { disableAnalyticsCookie } from './constants';

export const trackingIsDisabled = () => !!Cookies.get(disableAnalyticsCookie);

type InteractableConfig<T, S> = {
  events: string[];
  getState?: (element: T) => S,
  getStateChange: (element: T, state: S) => string | undefined;
  getTarget?: (element: T, state: S) => HTMLElement | undefined,
  match: (element: unknown) => element is T;
  state?: S;
};

// stupid thing to make TS infer the genric type of each config record
const makeInteractableConfig = <T, S = undefined>(config: InteractableConfig<T, S>) => config;

export const interactableElementEvents = [
  makeInteractableConfig({
    // using click instead of toggle because `toggle` doesn't bubble
    // keyboard navigation and touch also trigger the click event
    events: ['click'],
    getStateChange: (summary: HTMLElement) =>
      (summary.parentElement as HTMLDetailsElement | undefined)?.open ? 'close' : 'open',
    getTarget: (summary: HTMLElement) =>
      summary.parentElement?.tagName === 'DETAILS' ? summary.parentElement : undefined,
    match: (element: unknown): element is HTMLElement =>
      isHtmlElement(element) && element.tagName === 'SUMMARY',
  }),
  makeInteractableConfig({
    events: ['click'],
    getStateChange: (_element: HTMLAnchorElement | HTMLButtonElement) => undefined,
    match: (element: unknown): element is HTMLAnchorElement | HTMLButtonElement =>
      isHtmlElement(element) && ['A', 'BUTTON'].includes(element.tagName),
  }),
  makeInteractableConfig({
    events: ['focus', 'blur'],
    getState: (window: Window) => window.document.activeElement instanceof window.HTMLIFrameElement
      ? {iframe: window.document.activeElement}
      : {iframe: undefined},
    getStateChange: (window: Window, state: {iframe: HTMLIFrameElement | undefined}) =>
      window.document.activeElement === state.iframe ? 'focus-in' : 'focus-out',
    getTarget: (window: Window, state: {iframe: HTMLIFrameElement | undefined}) =>
      window.document.activeElement instanceof window.HTMLIFrameElement
        ? window.document.activeElement
        : state.iframe,
    match: (element: unknown): element is Window => isWindow(element),
    state: {iframe: undefined} as {iframe: HTMLIFrameElement | undefined},
  }),
];

type CombineGuardResults<I> = UnionToIntersection<I extends ((x: unknown) => x is infer T) ? T : never>;

export const addInteractiveListeners = (
  window: Window,
  handler: (target: HTMLElement, stateChange?: string) => void
) => {
  for (const config of interactableElementEvents) {
    let state = config.state as UnionToIntersection<typeof config['state']>;

    for (const event of config.events) {
      // eslint-disable-next-line no-loop-func
      window.addEventListener(event, (e: Event) => {
        const match = (el: unknown): el is CombineGuardResults<typeof config.match> => config.match(el);

        const target = e.target && match(e.target) ? e.target : (
          isNode(e.target) && findFirstAncestorOrSelf(e.target, match)
        );
        const reportedTarget = config.getTarget && target ? config.getTarget(target, state) : target;
        state = config.getState && target ? config.getState(target) as typeof state : state;
        const stateChange = target ? config.getStateChange(target, state) : undefined;

        if (reportedTarget) {
          handler(reportedTarget, stateChange);
        }
      });
    }
  }
};
