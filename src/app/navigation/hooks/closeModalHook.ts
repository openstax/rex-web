import { AppServices, MiddlewareAPI } from '../../types';

export const closeModal = () => (services: MiddlewareAPI & AppServices) => () => {
  if (services.history.location.state === undefined) {
    services.history.replace({
      search: '',
    });
  } else {
    services.history.goBack();
  }
};
