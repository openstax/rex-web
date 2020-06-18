import { HTMLElement } from '@openstax/types/lib.dom';
import { assertDocument } from '../../../utils';
import { validateDOMContent } from './validateDOMContent';

describe('validateDOMContent', () => {
  const document = assertDocument();
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('does not throw on valid link', () => {
    container.innerHTML = `
      <a href="other-page">asdf</a>
      <a href="https://othersite.com">asdf</a>
    `;

    expect(() => validateDOMContent(document, container)).not.toThrow();
  });

  it('throws on invalid link', () => {
    container.innerHTML = `
      <a href="/m123">asdf</a>
    `;

    expect(() => validateDOMContent(document, container)).toThrow();
  });
});
