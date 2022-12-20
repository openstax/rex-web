declare module '@openstax/ts-utils/dist' {
  export declare type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

  export declare const merge: <T extends {}[]>(...[thing1, ...tail]: T) => UnionToIntersection<T[number]>;
};

declare module '@openstax/ts-utils/dist/fetch' {
  export enum METHOD {
    GET = 'GET',
    HEAD = 'HEAD',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
    OPTIONS = 'OPTIONS',
  };

  export type FetchConfig = {
    credentials?: 'include' | 'omit' | 'same-origin';
    method?: METHOD;
    body?: string;
    headers?: {[key: string]: string};
  };
};

declare module '@openstax/ts-utils/dist/services/authProvider/browser' {
  import { FetchConfig, GenericFetch } from '../../fetch';

  export interface Window {
    fetch: GenericFetch;
    top: {} | null;
    parent: Pick<Window, 'postMessage'> | null;
    location: {
      search: string;
    };
    document: {
      referrer: string;
    };
    postMessage: (data: any, origin: string) => void;
    addEventListener: (event: 'message', callback: EventHandler) => void;
    removeEventListener: (event: 'message', callback: EventHandler) => void;
  }

  interface Initializer<C> {
    configSpace?: C;
    window: Window;
  }

  export declare type ConfigValue = string;
  export declare type ConfigValueProvider<V extends ConfigValue = ConfigValue> = (() => Promise<V> | V) | V;

  export interface User {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    full_name: string;
    uuid: string;
    faculty_status: string;
    is_administrator: boolean;
    is_not_gdpr_location: boolean;
    contact_infos: Array<{
      type: string;
      value: string;
      is_verified: boolean;
      is_guessed_preferred: boolean;
    }>;
  }

  export declare const browserAuthProvider: <C extends string = "auth">({ window, configSpace }: Initializer<C>) => (configProvider: { [key in C]: {
    accountsUrl: ConfigValueProvider<string>;
  }; }) => {
    /**
     * adds auth parameters to the url. this is only safe to use when using javascript to navigate
     * within the current window, eg `window.location = 'https://my.otherservice.com';` anchors
     * should use getAuthorizedLinkUrl for their href.
     *
     * result unreliable unless `getUser` is resolved first.
     */
    getAuthorizedUrl: (urlString: string) => string;
    /**
     * all link href-s must be rendered with auth tokens so that they work when opened in a new tab
     *
     * result unreliable unless `getUser` is resolved first.
     */
    getAuthorizedLinkUrl: (urlString: string) => string;
    /**
     * gets an authorized url for an iframe src. sets params on the url and saves its
     * origin to trust releasing user identity to it
     */
    getAuthorizedEmbedUrl: (urlString: string) => string;
    /**
     * gets second argument for `fetch` that has authentication token or cookie
     */
    getAuthorizedFetchConfig: () => Promise<FetchConfig>;
    /**
     * loads current user identity. does not reflect changes in identity after being called the first time.
     */
    getUser: () => Promise<User | undefined>;
  };
}
