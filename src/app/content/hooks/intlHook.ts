import createIntl from '../../messages/createIntl';
import { AppServices, MiddlewareAPI } from '../../types';
import { assertDefined } from '../../utils';

export const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const state = services.getState();
  const lang = assertDefined(state.content.book, 'Book not loaded').language;

  services.intl.current = await createIntl(lang);
};

export default hookBody;
