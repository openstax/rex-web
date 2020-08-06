import { HTMLElement } from '@openstax/types/lib.dom';
import { assertDocument } from '../../../utils';

describe('validateDOMContent', () => {
  const document = assertDocument();
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    jest.resetModules();
  });

  it('does not throw on valid link', () => {
    container.innerHTML = `
      <a href="other-page">asdf</a>
      <a href="https://othersite.com">asdf</a>
    `;

    const validateDOMContent = require('./validateDOMContent').validateDOMContent;
    expect(() => validateDOMContent(document, container)).not.toThrow();
  });

  describe('with unlimited content', () => {
    beforeEach(() => {
      jest.doMock( '../../../../config', () => ({
        ...jest.requireActual( '../../../../config'),
        UNLIMITED_CONTENT: true,
      }));
    });

    it('warns on invalid link', () => {
      container.innerHTML = `
        <a href="/m123">asdf</a>
      `;

      const validateDOMContent = require('./validateDOMContent').validateDOMContent;
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => null);

      expect(() => validateDOMContent(document, container)).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/^found invalid links/));
    });
  });

  describe('without unlimited content', () => {
    beforeEach(() => {
      jest.mock( '../../../../config', () => ({
        ...jest.requireActual( '../../../../config'),
        UNLIMITED_CONTENT: false,
      }));
    });

    it('throws on invalid link', () => {
      container.innerHTML = `
        <a href="/m123">asdf</a>
      `;

      const validateDOMContent = require('./validateDOMContent').validateDOMContent;
      expect(() => validateDOMContent(document, container)).toThrow();
    });
  });
});
