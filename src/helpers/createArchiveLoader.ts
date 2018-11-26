import { memoize } from 'lodash/fp';
import { ArchiveContent } from '../app/content/types';

export default (url: string) => memoize((id: string) => fetch(url + id)
  .then((response) => {
    if (response.status !== 200) {
      return response.text().then((message: string) => {
        throw new Error(`Error response from archive ${response.status}: ${message}`);
      });
    }
    return response;
  })
  .then((response) => response.json())
  .then((response) => response as ArchiveContent)
);
