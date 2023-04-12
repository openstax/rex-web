import { Book, Page } from '../../../app/content/types';
import { AnalyticsEvent } from './event';
import { track } from './pageFocus';

describe('elementInteracted', () => {

  it('finds context element', () => {
    const page = {id: 'pageid'} as Page;
    const result = track({
      book: {id: 'bookid', tree: {id: 'bookid', contents: [page]}} as unknown as Book,
      page
    }, {hasFocus: () => false, visibilityState: 'visible'} as any) as AnalyticsEvent | undefined;
    const payload = result?.getEventCapturePayload?.()();

    expect(payload).toEqual(expect.objectContaining({
      current: 'visible',
    }));
  });

  it('finds context element', () => {
    const page = {id: 'pageid'} as Page;
    const result = track({
      book: {id: 'bookid', tree: {id: 'bookid', contents: [page]}} as unknown as Book,
      page
    }, {hasFocus: () => false, visibilityState: 'hidden'} as any) as AnalyticsEvent | undefined;
    const payload = result?.getEventCapturePayload?.()();

    expect(payload).toEqual(expect.objectContaining({
      current: 'background',
    }));
  });

  it('finds context element', () => {
    const page = {id: 'pageid'} as Page;
    const result = track({
      book: {id: 'bookid', tree: {id: 'bookid', contents: [page]}} as unknown as Book,
      page
    }, {hasFocus: () => true, visibilityState: 'visible'} as any) as AnalyticsEvent | undefined;
    const payload = result?.getEventCapturePayload?.()();

    expect(payload).toEqual(expect.objectContaining({
      current: 'focused',
    }));
  });
});
