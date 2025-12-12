import { Document,  Element } from '@openstax/types/lib.dom';

export default (container: Element | Document) => {
  const imgs = Array.from(container.querySelectorAll('img'));
  imgs.forEach(img => {
    // Ensure lazy loading is disabled so images start loading immediately
    if (img.loading === 'lazy') {
      img.loading = 'eager';
    }

    // Force reload of cached images to ensure load event fires
    if (img.src && !img.complete) {
      const src = img.src;
      img.src = '';
      img.src = src;
    }
  });

  return Promise.all(imgs.map((img) => img.complete
    ? Promise.resolve()
    : new Promise<void>((resolve) => {

      const previousOnload = img.onload;
      const previousOnerror = img.onerror;

      img.onload = (...args) => {
        resolve();
        if (previousOnload) {
          previousOnload.apply(img, args);
        }
      };
      img.onerror = (...args) => {
        resolve();
        if (previousOnerror) {
          previousOnerror.apply(img, args);
        }
      };
    })
  )).then((): void => undefined);
};
