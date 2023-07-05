import { AccountsUser } from '../../gateways/createUserLoader';
import { AppServices, Store } from '../types';
import * as select from './selectors';

export const formatUser = (user: AccountsUser) => ({
  firstName: user.first_name,
  isNotGdprLocation: user.is_not_gdpr_location,
  lastName: user.last_name,
  uuid: user.uuid,
});

export const waitForAuthInitialization = async(app: {store: Store, services: AppServices}, timeout: number = 3000) => {
  const isInitialized = () => select.initialized(app.store.getState());

  if (isInitialized()) {
    return true;
  }

  let unsubscribe: () => void;
  let timeoutHandle: number;

  await Promise.race([
    new Promise<void>((resolve) => {
      unsubscribe = app.store.subscribe(() => isInitialized() && resolve());
    }),
    app.services.promiseCollector.calm(),
    new Promise((resolve) => timeoutHandle = setTimeout(resolve, timeout)),
  ]);

  clearTimeout(timeoutHandle!);
  unsubscribe!();

  return isInitialized();
};
