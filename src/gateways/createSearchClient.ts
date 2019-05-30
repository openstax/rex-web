import { Configuration, SearchApi } from '@openstax/open-search-client';

export default (url: string) => {
  const config = new Configuration({
    basePath: url,
    fetchApi: fetch.bind(window),
  });
  return new SearchApi(config);
};
