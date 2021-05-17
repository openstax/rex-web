import { assertDocument } from '../app/utils';

export default (containerId: string | null) => new Promise((resolve) => {
    if (!containerId) {
        return;
    }

    const script = assertDocument().createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', `https://www.googleoptimize.com/optimize.js?id=${containerId}`);
    script.onload = resolve;
    assertDocument().head.appendChild(script);
  });
