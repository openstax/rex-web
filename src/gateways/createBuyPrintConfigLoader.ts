import createCache, { Cache } from '../helpers/createCache';
import { rejectResponse } from '../helpers/fetch';
import Sentry from '../helpers/Sentry';

export interface BuyPrintResponse {
  buy_urls: Array<{
    url: string;
    provider: 'amazon' | 'openstax_fallback';
    allows_redirects: boolean;
    disclosure: string | null;
  }>;
}

interface Options {
  cache?: Cache<string, BuyPrintResponse>;
}

const defaultOptions = () => ({
  cache: createCache<string, BuyPrintResponse>({maxRecords: 5}),
});

export default (url: string, options: Options = {}) => {
  const {cache} = {...defaultOptions(), ...options};

  return {
    load: (book: {slug: string}) => {
      const cached = cache.get(book.slug);

      if (cached) {
        return Promise.resolve(cached);
      }

      return fetch(`${url}/${book.slug}.json`)
        .then((response) => {
          if (response.status === 200) {
            return response.json() as Promise<BuyPrintResponse>;
          } else {
            return rejectResponse(response,  (status, message) => `Error response from BuyPrint ${status}: ${message}`);
          }
        })
        .catch((e) => {
          Sentry.captureException(e);

          return Promise.resolve({
            buy_urls: [{
              allows_redirects: true,
              disclosure: null,
              provider: 'openstax_fallback',
              url: `${url}/${book.slug}`,
            }],
          } as BuyPrintResponse);
        })
        .then((response) => {
          cache.set(book.slug, response);
          return response;
        })
      ;
    },
  };
};
