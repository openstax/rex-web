import { BookWithOSWebData } from '../app/content/types';
import { acceptStatus } from '../helpers/fetch';

export interface OSWebBook {
  meta: {
    slug: string;
  };
  promote_image: BookWithOSWebData['promote_image'];
  publish_date: string | null;
  authors: Array<{
    value: {
      name: string;
      senior_author: boolean;
    }
  }>;
  book_state: BookWithOSWebData['book_state'];
  cover_color: BookWithOSWebData['theme'];
  cnx_id: string;
  amazon_link: string;
}

interface OSWebResponse {
  meta: {
    item_count: number
  };
  items: OSWebBook[];
}

export const fields = 'cnx_id,authors,publish_date,cover_color,amazon_link,book_state,promote_image';

export default (prefix: string) => {
  const baseUrl = `${prefix}/v2/pages`;
  const toJson = (response: any) => response.json() as Promise<OSWebResponse>;

  const firstRecord = (data: OSWebResponse) => data.items[0];

  const cache = new Map();

  const cacheRecord = (id: string) => (record: OSWebBook) => {
    if (!record) {
      cache.set(id, undefined);
    } else {
      cache.set(record.meta.slug, record);
      cache.set(record.cnx_id, record);
    }
    return record;
  };

  const loader = (buildUrl: (param: string) => string) => (param: string): Promise<OSWebBook | undefined> => {
    if (cache.has(param)) {
      return Promise.resolve(cache.get(param));
    }

    return fetch(buildUrl(param))
      .then(acceptStatus(200, (status, message) => `Error response from OSWeb ${status}: ${message}`))
      .then(toJson)
      .then(firstRecord)
      .then(cacheRecord(param))
    ;
  };

  const slugLoader = loader((slug: string) => `${baseUrl}?type=books.Book&fields=${fields}&slug=${slug}`);
  const idLoader = loader((id: string) => `${baseUrl}?type=books.Book&fields=${fields}&cnx_id=${id}`);

  return {
    getBookFromId: (id: string) => idLoader(id),
    getBookFromSlug: (slug: string) => slugLoader(slug),
    getBookIdFromSlug: (slug: string) => slugLoader(slug).then((book) => book && book.cnx_id),
    getBookSlugFromId: (id: string) => idLoader(id).then((book) => book && book.meta.slug),
    preloadCache: cacheRecord, // exposed for testing books that don't exist in osweb
  };
};
