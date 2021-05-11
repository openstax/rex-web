export default (containerId: string) => new Promise((resolve) => {
    if (typeof(document) === 'undefined' || !document.head) {
      throw new Error('Google Optimize can only be loaded in the browser');
    }

    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', `https://www.googleoptimize.com/optimize.js?id=${containerId}`);
    script.onload = resolve;
    document.head.appendChild(script);

    // if (typeof(window) !== 'undefined') {
    //   window.dataLayer.push('event', 'optimize.callback', {
    //     callback: () => console.log('callback triggered: '),
    //   });

    //   window.dataLayer.push({event: 'optimize.activate'});
    // }
  });
