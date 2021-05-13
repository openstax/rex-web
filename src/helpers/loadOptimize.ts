export default (containerId: string | null) => new Promise((resolve) => {
    if (!containerId) {
        return;
    }

    if (typeof(document) === 'undefined' || !document.head) {
      throw new Error('Google Optimize can only be loaded in the browser');
    }

    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', `https://www.googleoptimize.com/optimize.js?id=${containerId}`);
    script.onload = resolve;
    document.head.appendChild(script);
  });
