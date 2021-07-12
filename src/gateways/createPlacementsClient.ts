import { Configuration, PlacementsApi } from '@openstax/placements';

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
        }
        return Promise.resolve(response);
      }),
  });
  return new PlacementsApi(config);
};
