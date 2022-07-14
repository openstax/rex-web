import { Redirects } from '../../../../data/redirects/types';
import { getBookVersionFromUUIDSync } from '../../../gateways/createBookConfigLoader';
import * as contentSelect from '../../content/selectors';
import { ActionHookBody } from '../../types';
import { actionHook, BookNotFoundError } from '../../utils';
import { receivePageNotFoundId } from '../actions';

export const receivePageNotFoundIdHookBody: ActionHookBody<typeof receivePageNotFoundId> = (
  services
) => async() => {
  const state = services.getState();
  const book = contentSelect.book(state);
  const bookConfig = book ? getBookVersionFromUUIDSync(book.id) : undefined;

  const redirects: Redirects = await fetch('/rex/redirects.json')
    .then((res) => res.json())
    .catch(() => []);

  for (const {from, to} of redirects) {
    if (from === services.history.location.pathname) {
      services.history.replace(to);
      return;
    }
  }
  if (bookConfig?.retired) {
    throw new BookNotFoundError(`Could not resolve uuid: ${book?.id}`);
  }
};

export default actionHook(receivePageNotFoundId, receivePageNotFoundIdHookBody);
