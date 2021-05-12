export default (containerId: string) => new Promise((resolve) => {
    if (typeof(document) === 'undefined' || !document.head) {
      throw new Error('Google Optimize can only be loaded in the browser');
    }

    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', `https://www.googleoptimize.com/optimize.js?id=${containerId}`);
    script.onload = resolve;
    document.head.appendChild(script);

    if (typeof(window) !== 'undefined') {

      function gtag(arg1: any, arg2: any, arg3: any) {
        console.log(arg1, arg2, arg3);
        window!.dataLayer.push(arguments);
      }

      // function logVariant(variant: any) {
      //   console.log(variant);
      // }

      gtag('event', 'optimize.callback', {
        callback: (variant: any) => console.log(variant),
      });

      window!.dataLayer.push({event: 'optimize.activate'});
    }

  });
