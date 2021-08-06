import { AppServices, MiddlewareAPI } from '../types';
import createIntl from './createIntl';

export const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const state = services.getState();
  const lang = state.content.book?.language;

  if (!lang) {
    return;
  }

  services.intl = await createIntl(lang);
};

export default hookBody;
