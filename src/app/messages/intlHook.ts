import * as navigation from '../navigation/selectors';
import { AppServices, MiddlewareAPI } from '../types';
import createIntl from './createIntl';

export const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const state = services.getState();
  const match = navigation.match(state);
  const lang = match?.route.language;

  if (!lang) {
    return;
  }

  const intl = await createIntl(lang);
  // services.dispatch()
};

export default hookBody;
