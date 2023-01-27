import queryString from 'querystring';
import { AppServices, MiddlewareAPI } from '../../types';

export const closeModal = (services: MiddlewareAPI & AppServices) => () => {
  const currentQuery = services.history.location.search;
  const parsedQuery = queryString.parse(currentQuery?.substring(1)) || {};
  const {modal, query, target} = parsedQuery;

  // this is undefined if previous record is not on rex
  if (services.history.location.state === undefined) {
    services.history.replace({
      search: '',
    });
  // in case page is loaded with both search term and modal in the query
  // in which case receiveSearchHook will have added a previous record
  } else if (modal && query) {
    const newQuery = queryString.stringify({
      query,
      target,
    });
    services.history.replace(`?${newQuery}`);
  } else {
    services.history.goBack();
  }
};
