import { Element, NodeListOf } from '@openstax/types/lib.dom';
import { makeResourcesLazy } from './lazyResourceManager';

describe('lasyResourceManager', () => {
  const querySelectorAllSpy = jest.spyOn(document!, 'querySelectorAll');

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('makeResourcesLazy', () => {
    it('adds "loading" attribute with value "lazy"', () => {
      const img = document!.createElement('img');
      img.setAttribute('src', '/asdf');

      querySelectorAllSpy.mockReturnValue([
        img as Element,
      ] as unknown as NodeListOf<Element>);

      const srcBefore = img.getAttribute('src');
      makeResourcesLazy(document!);

      expect(img.getAttribute('loading')).toBe('lazy');
      expect(img.getAttribute('src')).toBe(srcBefore);
    });
  });
});
