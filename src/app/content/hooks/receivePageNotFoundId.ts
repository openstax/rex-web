import { Redirects } from '../../../../data/redirects/types';
import { ActionHookBody } from '../../types';
import { actionHook, BookNotFoundError } from '../../utils';
import { receivePageNotFoundId } from '../actions';

export const receivePageNotFoundIdHookBody: ActionHookBody<typeof receivePageNotFoundId> = (
  services
) => async(action) => {
  const { bookId } = action.payload;
  const bookConfig = bookId ? await services.bookConfigLoader.getBookVersionFromUUID(bookId) : undefined;

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
    return Promise.reject(new BookNotFoundError(`Could not resolve uuid: ${bookId}`));
  }
};

export default actionHook(receivePageNotFoundId, receivePageNotFoundIdHookBody);
