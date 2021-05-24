import { receiveExperiments } from '../app/featureFlags/actions';
import { Store } from '../app/types';
import { assertDocument } from '../app/utils';
import config from '../config';

export const getOptimizeContainerByEnv = (window: Window) => {
  return config.DEPLOYED_ENV === 'server' ? null
  : (window.location.hostname === 'openstax.org' ? 'OPT-NFHSM4B' : 'OPT-W65B3CP');
};

export default (window: Window, store: Store) => new Promise((resolve) => {
    const containerId = getOptimizeContainerByEnv(window);
    if (!containerId) {
      return;
    }
    const script = assertDocument().createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', `https://www.googleoptimize.com/optimize.js?id=${containerId}`);
    script.onload = resolve;
    assertDocument().head.appendChild(script);

    window.gtag('event', 'optimize.callback', {
      callback: (idx: string, id: string) => {
        store.dispatch(receiveExperiments([id, idx]));
      },
    });
    window.dataLayer.push({event: 'optimize.activate'});
  });
