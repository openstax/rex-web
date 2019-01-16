import { updateAvailable } from '../app/notifications/actions';
import { Store } from '../app/types';
import { APP_ENV, RELEASE_ID } from '../config';

export default (store: Store) => {
  if (APP_ENV !== 'production') {
    return;
  }

  const interval = setInterval(poll, 60 * 1000);

  async function poll() {
    const release = await fetch('/rex/release.json')
      .then((response) => response.json())
      .catch(() => ({id: RELEASE_ID}));

    if (release.id !== RELEASE_ID) {
      clearInterval(interval);
      store.dispatch(updateAvailable());
    }
  }
};
