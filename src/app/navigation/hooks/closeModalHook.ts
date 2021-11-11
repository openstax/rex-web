import { AppServices, MiddlewareAPI } from '../../types';

export const closeModal = () => (services: MiddlewareAPI & AppServices) => () => {
  if (window?.history.state) {
    services.history.goBack();
  } else {
    services.history.replace({
      search: '',
    });
  }
};
