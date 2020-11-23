import { AppServices, MiddlewareAPI } from '../../types';

export const closeModal = (services: MiddlewareAPI & AppServices) => services.history.goBack;
