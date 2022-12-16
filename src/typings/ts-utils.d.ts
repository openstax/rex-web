declare module '@openstax/ts-utils/dist/fetch' {
  export enum METHOD {
    GET = 'GET',
    HEAD = 'HEAD',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
    OPTIONS = 'OPTIONS',
  }

  export type FetchConfig = {
    credentials?: 'include' | 'omit' | 'same-origin';
    method?: METHOD;
    body?: string;
    headers?: {[key: string]: string};
  };
}

declare module '@openstax/ts-utils/dist/services/authProvider/browser';
