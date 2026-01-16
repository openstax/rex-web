import { BookWithOSWebData } from '../app/content/types';
import createCache, { Cache } from '../helpers/createCache';
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
  book_subjects: Array<{subject_name: string}>;
  book_categories: Array<{subject_name: string; subject_category: string}>;
  cnx_id: string;
  amazon_link: string;
  polish_site_link: string;
  content_warning_text: string | null;
  require_login_message_text: string | null;
  id: number;
}
export interface OSWebSchoolData {
  id: number,
  salesforce_id: string,
  name: string;
  industry: string;
}

interface OSWebResponse {
  meta: {
    item_count: number
  };
  items: OSWebBook[];
}

interface OSWebPortalResponse {
  school_data: OSWebSchoolData;
}

export const fields = [
  'cnx_id',
  'authors',
  'publish_date',
  'cover_color',
  'amazon_link',
  'polish_site_link',
  'book_state',
  'promote_image',
  'book_subjects',
  'book_categories',
  'content_warning_text',
  'require_login_message_text',
  'id',
].join(',');

interface Options {
  cache?: Cache<string, OSWebBook | undefined>;
}

const defaultOptions = () => ({
  cache: createCache<string, OSWebBook | undefined>({maxRecords: 10}),
});

export default (prefix: string, options: Options  = {}) => {
  const {cache} = {...defaultOptions(), ...options};
  const baseUrl = `${prefix}/v2/pages`;
  const toJson = (response: Response) => response.json();

  const firstRecord = (data: OSWebResponse) => data.items[0];

  const cacheRecord = (id: string) => (record: OSWebBook) => {
    if (!record) {
      cache.set(id, undefined);
    } else {
      cache.set(record.meta.slug, record);
      cache.set(record.cnx_id, record);
    }
    return record;
  };

  const loader = <T>(buildUrl: (param: string) => string, type: 'book' | 'portal') => (param: string): Promise<T | undefined> => {
    const cached = cache.get(param);
    if (cached && type === 'book') {
      return Promise.resolve(cached as T);
    }

    return fetch(buildUrl(param))
      .then(acceptStatus(200, (status, message) => new Error(`Error response from OSWeb ${status}: ${message}`)))
      .then(toJson)
      .then((data: OSWebResponse | OSWebPortalResponse) => type === 'book'
        ? firstRecord(data as OSWebResponse)
        : (data as OSWebPortalResponse).school_data
      )
      .then((record) => {
        if (type === 'book') {
          return cacheRecord(param)(record as OSWebBook) as T;
        }
        return record as T;
      });
  };

  const slugLoader = loader<OSWebBook>((slug: string) => `${baseUrl}?type=books.Book&fields=${fields}&slug=${slug}`, 'book');
  const idLoader = loader<OSWebBook>((id: string) => `${baseUrl}?type=books.Book&fields=${fields}&cnx_id=${id}`, 'book');
  const portalLoader = loader<OSWebSchoolData>((portalName: string) => `${baseUrl}/${portalName}`, 'portal');

  return {
    getBookFromId: (id: string) => idLoader(id),
    getBookFromSlug: (slug: string) => slugLoader(slug),
    getSchoolDataFromPortalName: (portalName: string) => portalLoader(portalName),
    getBookIdFromSlug: (slug: string) => slugLoader(slug).then((book) => book && book.cnx_id),
    getBookSlugFromId: (id: string) => idLoader(id).then((book) => book && book.meta.slug),
    preloadCache: cacheRecord, // exposed for testing books that don't exist in osweb
  };
};
