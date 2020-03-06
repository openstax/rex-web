import { Document,  Element } from '@openstax/types/lib.dom';

export default (container: Element | Document) => {
  return Promise.all(Array.from(container.querySelectorAll('img')).map((img) => img.complete
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
