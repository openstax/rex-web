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

export default (url: string) => {
  return {
    load: (book: {slug: string}) => fetch(`${url}/${book.slug}.json`)
      .then((response) => {
        if (response.status === 200) {
          return response.json() as Promise<BuyPrintResponse>;
        } else {
          return rejectResponse(response,  (status, message) => `Error response from BuyPrint ${status}: ${message}`);
        }
      }).catch((e) => {
        Sentry.captureException(e);

        return Promise.resolve({
          buy_urls: [{
            allows_redirects: true,
            disclosure: null,
            provider: 'openstax_fallback',
            url: `${url}/${book.slug}`,
          }],
        }) as Promise<BuyPrintResponse>;
      }),
  };
};
