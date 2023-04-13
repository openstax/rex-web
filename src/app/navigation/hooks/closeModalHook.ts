import queryString from 'querystring';
import { AppServices, MiddlewareAPI } from '../../types';

export const closeModal = (services: MiddlewareAPI & AppServices) => () => {
  const queryStr = services.history.location.search;
  const parsedQuery = queryString.parse(queryStr?.substring(1));
  const {modal, ...rest} = parsedQuery;

  // this is undefined if previous record is not on rex
  if (services.history.location.state === undefined || services.history.location.state.depth === 0) {
    services.history.replace({
      search: queryString.stringify(rest),
    });
  } else {
    services.history.goBack();
  }
};
