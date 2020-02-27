import { Configuration, HighlightsApi } from '@openstax/highlighter/dist/api';
import { receiveLoggedOut } from '../app/auth/actions';
import { assertWindow } from '../app/utils';

const formatError = (response: Response) => {
  return response.json()
    .then(({messages}) => {
      return Promise.reject(`${response.statusText}: ${messages.join(', ')}`);
    });
};

export class DoNotHandleMe extends Error {}

export default (url: string) => {
  const config = new Configuration({
    basePath: url,
    credentials: 'include',
    fetchApi: (...args) => fetch(...args)
      .then((response) => {
        console.log('response stats', response.status)
        if (response.status === 422) {
          return formatError(response);
        } else if (response.status === 401) {
          assertWindow().__APP_STORE.dispatch(receiveLoggedOut());
          return Promise.reject(new DoNotHandleMe());
        }
        return Promise.resolve(response);
      }),
  });
  return new HighlightsApi(config);
};
