import { Configuration, HighlightsApi } from '@openstax/highlighter/dist/api';
import { UnauthenticatedError } from '../app/types';

const formatError = (response: Response) => {
  return response.json()
    .then(({messages}) => {
      return Promise.reject(`${response.statusText}: ${messages.join(', ')}`);
    });
};

export default (url: string) => {
  const config = new Configuration({
    basePath: url,
    credentials: 'include',
    fetchApi: (...args) => fetch(...args)
      .then((response) => {
        if (response.status === 422) {
          return formatError(response);
        } else if (response.status === 401) {
          return Promise.reject(new UnauthenticatedError());
        }
        return Promise.resolve(response);
      }),
  });
  return new HighlightsApi(config);
};
