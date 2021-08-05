import { Configuration, SearchApi } from '../clients/open-search';

export default (url: string) => {
  const config = new Configuration({
    basePath: url,
    fetchApi: (...args) => fetch(...args),
  });
  return new SearchApi(config);
};
