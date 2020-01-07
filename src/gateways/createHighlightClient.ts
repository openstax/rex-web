import { Configuration, HighlightsApi } from '@openstax/highlighter/dist/api';

export default (url: string) => {
  const config = new Configuration({
    basePath: url,
    credentials: 'always',
    fetchApi: (...args) => fetch(...args),
  });
  return new HighlightsApi(config);
};
