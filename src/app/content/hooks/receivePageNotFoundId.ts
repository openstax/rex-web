import { Redirects } from '../../../../data/redirects/types';
import { ActionHookBody } from '../../types';
import { actionHook } from '../../utils';
import { receivePageNotFoundId } from '../actions';

export const receivePageNotFoundIdHookBody: ActionHookBody<typeof receivePageNotFoundId> = (
  services
) => async() => {
  const redirects: Redirects = await fetch('/rex/redirects.json')
    .then((res) => res.json())
    .catch(() => []);

  for (const {from, to} of redirects) {
    if (from === services.history.location.pathname) {
      services.history.replace(to);
      return;
    }
  }
};

export default actionHook(receivePageNotFoundId, receivePageNotFoundIdHookBody);
