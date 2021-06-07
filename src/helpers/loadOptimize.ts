import { receiveExperiments } from '../app/featureFlags/actions';
import { Store } from '../app/types';
import { assertDocument } from '../app/utils';
import config from '../config';

export const getOptimizeContainerByEnv = () =>
  config.DEPLOYED_ENV === 'openstax.org' ? 'OPT-NFHSM4B' : 'OPT-W65B3CP';

export const getCallback = (store: Store) => (idx: string, id: string) => {
  store.dispatch(receiveExperiments([id, idx]));
};

export default (window: Window, store: Store) => new Promise((resolve) => {
    const containerId = getOptimizeContainerByEnv();

    const script = assertDocument().createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', `https://www.googleoptimize.com/optimize.js?id=${containerId}`);
    script.onload = resolve;
    assertDocument().head.appendChild(script);

    window.gtag('event', 'optimize.callback', {
      callback: getCallback(store),
    });
    window.dataLayer.push({event: 'optimize.activate'});
  });
