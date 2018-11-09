import { memoize } from 'lodash/fp';
import { ArchiveContent } from './types';

const ARCHIVE_URL = process.env.REACT_APP_ARCHIVE_URL;

export const archiveLoader = memoize((id) => {
  return fetch(ARCHIVE_URL + id)
    .then((response) => {
      if (response.status !== 200) {
        throw new Error('asdf');
      }
      return response;
    })
    .then((response) => response.json())
    .then((response) => response as ArchiveContent)
  ;
});
