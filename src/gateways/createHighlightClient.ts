import { Configuration, HighlightsApi } from '@openstax/highlighter/dist/api';
import { makeApiCallOrThrow } from '../app/utils';

export default (url: string) => {
  const config = new Configuration({
    basePath: url,
    credentials: 'include',
    fetchApi: (...args) => makeApiCallOrThrow(fetch(...args)),
  });
  return new HighlightsApi(config);
};
