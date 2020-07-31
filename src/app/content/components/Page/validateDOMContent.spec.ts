import { HTMLElement } from '@openstax/types/lib.dom';
import { assertDocument } from '../../../utils';
import { PagePropTypes } from './connector';
import { validateDOMContent } from './validateDOMContent';

describe('validateDOMContent', () => {
  const document = assertDocument();
  let container: HTMLElement;
  let pageProps: PagePropTypes;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    container = document.createElement('div');
    pageProps = {
      navigationQuery: {},
    } as PagePropTypes;

    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => null);
  });

  it('does not throw on valid link', () => {
    container.innerHTML = `
      <a href="other-page">asdf</a>
      <a href="https://othersite.com">asdf</a>
    `;

    expect(() => validateDOMContent(document, container, pageProps)).not.toThrow();
  });

  describe('on invalid link', () => {
    beforeEach(() => {
      container.innerHTML = `
        <a href="/m123">asdf</a>
      `;
    });

    it('throws if validateLinks query param is present', () => {
      Object.defineProperty(pageProps.navigationQuery, 'validateLinks', {});
      expect(() => validateDOMContent(document, container, pageProps)).toThrow();
    });

    it('warns if validateLinks query param is missing', () => {
      expect(() => validateDOMContent(document, container, pageProps)).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/^found invalid links/));
    });
  });
});
