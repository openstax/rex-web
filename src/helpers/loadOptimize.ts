import { assertWindow } from '../app/utils';

export default (containerId: string) => new Promise((resolve) => {
    if (typeof(document) === 'undefined' || !document.head) {
      throw new Error('Google Optimize can only be loaded in the browser');
    }

    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', `https://www.googleoptimize.com/optimize.js?id=${containerId}`);
    script.onload = resolve;
    document.head.appendChild(script);

    const window = assertWindow('Browser entrypoint must be used in the browser');

    function myCallback() {
        console.log('my callback: ', arguments);
    }

    window.dataLayer.push('event', 'optimize.callback', {
        callback: myCallback,
    });
    window.dataLayer.push({event: 'optimize.activate'});
  });
