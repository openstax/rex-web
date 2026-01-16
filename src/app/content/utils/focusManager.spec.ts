import * as utils from '../../utils/browser-assertions';
import { captureOpeningElement, clearOpeningElement, getOpeningElement } from './focusManager';
import { HTMLButtonElement } from '@openstax/types/lib.dom';

describe('focusManager', () => {
  let mockButton: HTMLButtonElement;

  beforeEach(() => {
    const document = utils.assertDocument();
    mockButton = document.createElement('button');
    document.body.appendChild(mockButton);
  });

  afterEach(() => {
    mockButton.remove();
    clearOpeningElement('test-modal');
  });

  it('captures opening element when activeElement exists', () => {
    mockButton.focus();

    captureOpeningElement('test-modal');

    expect(getOpeningElement('test-modal')).toBe(mockButton);
  });

  it('does not store element when activeElement is null', () => {
    // Create a spy on assertDocument to return a document with null activeElement
    const mockDocument = {
      activeElement: null,
    };
    jest.spyOn(utils, 'assertDocument').mockReturnValue(mockDocument as any);

    captureOpeningElement('test-modal');

    // Should not have stored anything when activeElement is null
    expect(getOpeningElement('test-modal')).toBe(null);

    // Restore the original implementation
    jest.restoreAllMocks();
  });

  it('returns null for non-existent modal id', () => {
    expect(getOpeningElement('non-existent-modal')).toBe(null);
  });

  it('clears opening element', () => {
    mockButton.focus();
    captureOpeningElement('test-modal');

    expect(getOpeningElement('test-modal')).toBe(mockButton);

    clearOpeningElement('test-modal');

    expect(getOpeningElement('test-modal')).toBe(null);
  });
});
