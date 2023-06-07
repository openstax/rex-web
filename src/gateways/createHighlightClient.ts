import { Configuration, HighlightsApi } from '@openstax/highlighter/dist/api';
import { FetchConfig } from '@openstax/ts-utils/fetch';
import merge from 'lodash/fp/merge';
import { UnauthenticatedError } from '../app/utils';
import { HighlightLoadError } from '../app/content/highlights/errors';

const formatError = (response: Response) => {
  return response.json()
    .then(({messages}) => {
      return Promise.reject(`${response.statusText}: ${messages.join(', ')}`);
    });
};

export default (basePath: string, getAuthorizedFetchConfig: () => Promise<FetchConfig> = () => Promise.resolve({})) => {
  const config = new Configuration({
    basePath,
    fetchApi: async(url: string, fetchConfig: FetchConfig) => {
      const authorizedFetchConfig = await getAuthorizedFetchConfig();
      let response;
      try {
        response = await fetch(url, merge(fetchConfig, authorizedFetchConfig));
      } catch(e) {
        throw new HighlightLoadError({ destination: 'page', shouldAutoDismiss: true });
      }

      if (response.status === 422) {
        return formatError(response);
      } else if (response.status === 401) {
        throw new UnauthenticatedError();
      }
      return response;
    },
  });
  return new HighlightsApi(config);
};
