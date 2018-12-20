import memoize from 'lodash/fp/memoize';

interface OSWebResponse {
  meta: {
    item_count: number
  };
  items: Array<{
    meta: {
      slug: string;
    };
    cnx_id: string
  }>;
}

export default (url: string) => {

  const handleError = (response: any) => {
    if (response.status !== 200) {
      return response.text().then((message: string) => {
        throw new Error(`Error response from OSWeb ${response.status}: ${message}`);
      });
    }
    return response;
  };

  const toJson = (response: any) => response.json() as Promise<OSWebResponse>;

  const firstRecord = (data: OSWebResponse) => {
    if (!data.items[0]) {
      throw new Error('OSWeb record not found');
    }
    return data.items[0];
  };

  const fields = 'cnx_id';
  const slugLoader = memoize((slug: string) => fetch(`${url}?type=books.Book&fields=${fields}&slug=${slug}`)
    .then(handleError)
    .then(toJson)
    .then(firstRecord)
  );
  const idLoader = memoize((id: string) => fetch(`${url}?type=books.Book&fields=${fields}&cnx_id=${id}`)
    .then(handleError)
    .then(toJson)
    .then(firstRecord)
  );

  return {
    getBookIdFromSlug: (slug: string) => slugLoader(slug).then(({cnx_id}) => cnx_id),
    getBookSlugFromId: (id: string) => idLoader(id).then(({meta: {slug}}) => slug),
  };
};
