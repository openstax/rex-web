import { Configuration, HighlightsApi } from '@openstax/highlighter/dist/api';
import { merge } from '@openstax/ts-utils/dist';
import { FetchConfig } from '@openstax/ts-utils/dist/fetch';
import { UnauthenticatedError } from '../app/utils';

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
      const response = await fetch(url, merge(fetchConfig, authorizedFetchConfig));

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
