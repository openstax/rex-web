import { Element, NodeListOf } from '@openstax/types/lib.dom';
import * as domUtils from '../../../domUtils';
import { addScrollHandler, checkLazyResources, makeResourcesLazy, removeScrollHandler } from './lazyResourceManager';

describe('lasyResourceManager', () => {
  const querySelectorAllSpy = jest.spyOn(document!, 'querySelectorAll');
  const addEventListenerSpy = jest.spyOn(document!, 'addEventListener');
  const removeEventListenerSpy = jest.spyOn(document!, 'removeEventListener');
  const elementIsVisibleSpy = jest.spyOn(domUtils, 'elementIsVisibleInWindow');

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('makeResourcesLazy', () => {
    it('moves src to data-lazy-src', () => {
      const img = document!.createElement('img');
      img.setAttribute('src', '/asdf');

      querySelectorAllSpy.mockReturnValue([
        img as Element,
      ] as unknown as NodeListOf<Element>);

      makeResourcesLazy(document!);

      expect(img.getAttribute('src')).toBe(null);
      expect(img.getAttribute('data-lazy-src')).toBe('/asdf');
    });

    it('ignores src if empty', () => {
      const img = document!.createElement('img');
      img.setAttribute('src', '');

      querySelectorAllSpy.mockReturnValue([
        img as Element,
      ] as unknown as NodeListOf<Element>);

      makeResourcesLazy(document!);

      expect(img.getAttribute('src')).toBe('');
      expect(img.getAttribute('data-lazy-src')).toBe(null);
    });
  });

  describe('checkLazyResources', () => {
    it('moves data-lazy-src to src for visible elements', () => {
      const img1 = document!.createElement('img');
      img1.setAttribute('data-lazy-src', '/asdf1');

      const img2 = document!.createElement('img');
      img2.setAttribute('data-lazy-src', '/asdf2');

      querySelectorAllSpy.mockReturnValue([
        img1 as Element,
        img2 as Element,
      ] as unknown as NodeListOf<Element>);

      elementIsVisibleSpy.mockImplementation((element: Element) => element === img2);

      checkLazyResources();

      expect(img1.getAttribute('src')).toBe(null);
      expect(img1.getAttribute('data-lazy-src')).toBe('/asdf1');
      expect(img2.getAttribute('src')).toBe('/asdf2');
      expect(img2.getAttribute('data-lazy-src')).toBe(null);
    });

    it('removes invalid empty lazy src', () => {
      const img1 = document!.createElement('img');
      img1.setAttribute('data-lazy-src', '');

      querySelectorAllSpy.mockReturnValue([
        img1 as Element,
      ] as unknown as NodeListOf<Element>);

      elementIsVisibleSpy.mockReturnValue(true);

      checkLazyResources();

      expect(img1.getAttribute('src')).toBe(null);
      expect(img1.getAttribute('data-lazy-src')).toBe(null);
    });
  });

  describe('outside browser', () => {
    const windowBackup = window!;
    const documentBackup = document!;

    beforeEach(() => {
      delete (global as any).window;
      delete (global as any).document;
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('still runs makeResourcesLazy', () => {
      const img = documentBackup.createElement('img');
      img.setAttribute('src', '/asdf');

      querySelectorAllSpy.mockReturnValue([
        img as Element,
      ] as unknown as NodeListOf<Element>);

      makeResourcesLazy(documentBackup);

      expect(querySelectorAllSpy).toHaveBeenCalled();
      expect(img.getAttribute('src')).toBe(null);
      expect(img.getAttribute('data-lazy-src')).toBe('/asdf');
    });

    it('checkLazyResources noops', () => {
      expect(checkLazyResources).not.toThrow();
      expect(querySelectorAllSpy).not.toHaveBeenCalled();
    });

    it('addScrollHandler noops', () => {
      expect(addScrollHandler).not.toThrow();
      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it('removeScrollHandler noops', () => {
      expect(removeScrollHandler).not.toThrow();
      expect(removeEventListenerSpy).not.toHaveBeenCalled();
    });
  });
});
