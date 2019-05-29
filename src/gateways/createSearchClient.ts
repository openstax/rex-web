import { Configuration, StoreApi } from '@openstax/open-search-client';

export default (url: string) => {
  const config = new Configuration({
    basePath: url,
    fetchApi: fetch,
  });
  const client = new StoreApi(config);

  return client;
};
