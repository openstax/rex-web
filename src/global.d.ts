/// <reference lib="es2017" />
/// <reference lib="es2017.object" />
import * as dom from '@openstax/types/lib.dom';
import { compose } from 'redux';
import { AppServices, AppState } from './app/types';
import PromiseCollector from './helpers/PromiseCollector';

declare var NodeFilter: {
  readonly FILTER_ACCEPT: number;
  readonly FILTER_REJECT: number;
  readonly FILTER_SKIP: number;
  readonly SHOW_ALL: number;
  readonly SHOW_ATTRIBUTE: number;
  readonly SHOW_CDATA_SECTION: number;
  readonly SHOW_COMMENT: number;
  readonly SHOW_DOCUMENT: number;
  readonly SHOW_DOCUMENT_FRAGMENT: number;
  readonly SHOW_DOCUMENT_TYPE: number;
  readonly SHOW_ELEMENT: number;
  readonly SHOW_ENTITY: number;
  readonly SHOW_ENTITY_REFERENCE: number;
  readonly SHOW_NOTATION: number;
  readonly SHOW_PROCESSING_INSTRUCTION: number;
  readonly SHOW_TEXT: number;
};

declare global {

  interface Window extends dom.Window {
    __PRELOADED_STATE__?: Partial<AppState>;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof compose;
    __APP_SERVICES: AppServices;
    __APP_ASYNC_HOOKS: PromiseCollector;

    NodeFilter: NodeFilter;
    MouseEvent: {
      prototype: dom.MouseEvent;
      new(typeArg: string, eventInitDict?: dom.MouseEventInit): dom.MouseEvent;
    };
    HTMLAnchorElement: {
      prototype: dom.HTMLAnchorElement;
      new(): dom.HTMLAnchorElement;
    };
    Element: {
      prototype: dom.Element;
      new(): dom.Element;
    };
    MathJax: any;
  }

  var fetch: (input: dom.RequestInfo, init?: dom.RequestInit) => Promise<Response>;
  var window: Window | undefined;
  var document: dom.Document | undefined;
  var navigator: dom.Navigator | undefined;
  var URL: dom.URLConstructor | undefined;
}
