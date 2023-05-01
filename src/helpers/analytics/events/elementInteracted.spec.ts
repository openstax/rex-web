import { Book, Page } from '../../../app/content/types';
import { assertDocument } from '../../../app/utils';
import { track } from './elementInteracted';

describe('elementInteracted', () => {
  const document = assertDocument();

  it('finds context element', () => {
    const anchor = document.createElement('a');
    const parent = document.createElement('div');
    parent.setAttribute('data-type', 'media');
    parent.setAttribute('id', 'foo');
    parent.setAttribute('random-attribute', 'random-value');
    parent.append(anchor);
    const page = {id: 'pageid'} as Page;
    const result = track(
      {book: {id: 'bookid', tree: {id: 'bookid', contents: [page]}} as unknown as Book, page}, anchor
    );

    if (!result) {
      return expect(result).toBeTruthy();
    }
    if (!result.getEventCapturePayload) {
      return expect(result.getEventCapturePayload).toBeTruthy();
    }

    const payload = result.getEventCapturePayload()();

    expect(payload.context_attributes['random-attribute']).toBe('random-value');
    expect(payload.context_type).toBe('DIV');
  });

  describe('no content', () => {
    it('has no event capture payload', () => {
      const anchor = document.createElement('a');
      const event = track({ book: undefined, page: undefined }, anchor);

      if (!event) {
        return expect(event).toBeTruthy();
      }

      expect(event.getEventCapturePayload).toBeUndefined();
    });
  });
});
