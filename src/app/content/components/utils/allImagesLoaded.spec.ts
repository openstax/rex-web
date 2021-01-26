import { HTMLDivElement, HTMLImageElement } from '@openstax/types/lib.dom';
import { resetModules } from '../../../../test/utils';
import { assertDocument } from '../../../utils';
import allImagesLoaded from './allImagesLoaded';

describe('allImagesLoaded', () => {
  let element: HTMLDivElement;
  let img: HTMLImageElement;
  let finished: boolean;

  beforeEach(() => {
    resetModules();

    finished = false;
    element = assertDocument().createElement('div');
    img = assertDocument().createElement('img');
  });

  it('resolves when passed an element with no images', async() => {
    await expect(allImagesLoaded(element)).resolves.toBeUndefined();
  });

  it('resolves when passed an image that is already loaded', async() => {
    element.appendChild(img);

    Object.defineProperty(img, 'complete', {
      value: true,
      writable: false,
    });

    await expect(allImagesLoaded(element)).resolves.toBeUndefined();
  });

  describe('onload', () => {
    it('resolves once images are loaded', async() => {
      const onloadHandler = jest.fn();
      img.onload = onloadHandler;

      element.appendChild(img);

      allImagesLoaded(element).then(() => finished = true);

      if (!img.onload) {
        return expect(img.onload).toBeTruthy();
      }

      await new Promise((resolve) => setImmediate(resolve));
      expect(finished).toBe(false);

      expect(img.onload).not.toBe(onloadHandler);
      img.onload({} as any);

      await new Promise((resolve) => setImmediate(resolve));
      expect(finished).toBe(true);
    });

    it('resolves once images are loaded without onload handler', async() => {
      element.appendChild(img);

      allImagesLoaded(element).then(() => finished = true);

      if (!img.onload) {
        return expect(img.onload).toBeTruthy();
      }

      await new Promise((resolve) => setImmediate(resolve));
      expect(finished).toBe(false);

      img.onload({} as any);

      await new Promise((resolve) => setImmediate(resolve));
      expect(finished).toBe(true);
    });
  });

  describe('onerror', () => {
    it('resolves if images error', async() => {
      const onerrorHandler = jest.fn();
      img.onerror = onerrorHandler;

      element.appendChild(img);

      allImagesLoaded(element).then(() => finished = true);

      if (!img.onerror) {
        return expect(img.onerror).toBeTruthy();
      }

      await new Promise((resolve) => setImmediate(resolve));
      expect(finished).toBe(false);

      expect(img.onerror).not.toBe(onerrorHandler);
      img.onerror({} as any);

      expect(onerrorHandler).toHaveBeenCalled();

      await new Promise((resolve) => setImmediate(resolve));
      expect(finished).toBe(true);
    });

    it('resolves if images error without onerror handler', async() => {
      element.appendChild(img);

      allImagesLoaded(element).then(() => finished = true);

      if (!img.onerror) {
        return expect(img.onerror).toBeTruthy();
      }

      await new Promise((resolve) => setImmediate(resolve));
      expect(finished).toBe(false);

      img.onerror({} as any);

      await new Promise((resolve) => setImmediate(resolve));
      expect(finished).toBe(true);
    });
  });
});
