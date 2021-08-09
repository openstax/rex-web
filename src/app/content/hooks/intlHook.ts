import createIntl from '../../messages/createIntl';
import { AppServices, MiddlewareAPI } from '../../types';

export const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const state = services.getState();
  const lang = state.content.book?.language;

  services.intl.current = await createIntl(lang || '');
};

export default hookBody;
