import { Configuration, DefaultApi, SearchApi } from '@openstax/open-search-client';

export default (url: string) => {
  const config = new Configuration({
    basePath: url,
    fetchApi: (...args) => fetch(...args),
  });

  const searchApi = new SearchApi(config);
  const defaultApi = new DefaultApi(config);

  return {
    info: defaultApi.info.bind(defaultApi),
    search: searchApi.search.bind(searchApi),
  };
};
