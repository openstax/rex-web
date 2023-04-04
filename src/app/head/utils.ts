import { AppServices, Store } from '../types';
import * as select from './selectors';

export const waitForHeadInitializaton = async(app: {store: Store, services: AppServices}, timeout: number = 3000) => {
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
