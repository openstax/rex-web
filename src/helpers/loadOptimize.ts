import { assertDocument, assertWindow } from '../app/utils';
import config from '../config';

const getOptimizeContainerByEnv = () => {
  const window = assertWindow();
  return config.DEPLOYED_ENV === 'server' ? null
  : (window.location.hostname === 'openstax.org' ? 'OPT-NFHSM4B' : 'OPT-W65B3CP');
};

export default () => new Promise((resolve) => {
    const containerId = getOptimizeContainerByEnv();
    if (!containerId) {
      return;
    }
    const script = assertDocument().createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', `https://www.googleoptimize.com/optimize.js?id=${containerId}`);
    script.onload = resolve;
    assertDocument().head.appendChild(script);
  });
