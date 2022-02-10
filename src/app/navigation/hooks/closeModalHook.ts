import { AppServices, MiddlewareAPI } from '../../types';

export const closeModal = (services: MiddlewareAPI & AppServices) => () => {
  // this is undefined if previous record is not on rex
  if (services.history.location.state === undefined) {
    services.history.replace({
      search: '',
    });
  } else {
    services.history.goBack();
  }
};
