import { ActionHookBody } from '../../types';
import { actionHook } from '../../utils';
import { receivePageNotFoundId } from '../actions';
import { processBrowserRedirect } from '../utils/processBrowserRedirect';

export const receivePageNotFoundIdHookBody: ActionHookBody<typeof receivePageNotFoundId> = (
  services
) => async() => {
  console.log('page not found')
  await processBrowserRedirect(services);
};

export default actionHook(receivePageNotFoundId, receivePageNotFoundIdHookBody);
