import { AnalyticsEvent } from './event';
import { track } from './pageFocus';

describe('elementInteracted', () => {

  it('finds context element', () => {
    const result = track({}, {hasFocus: () => false, visibilityState: 'visible'} as any) as AnalyticsEvent | undefined;
    const payload = result?.getEventCapturePayload?.()();

    expect(payload).toEqual(expect.objectContaining({
      current: 'visible',
    }));
  });

  it('finds context element', () => {
    const result = track({}, {hasFocus: () => false, visibilityState: 'hidden'} as any) as AnalyticsEvent | undefined;
    const payload = result?.getEventCapturePayload?.()();

    expect(payload).toEqual(expect.objectContaining({
      current: 'background',
    }));
  });

  it('finds context element', () => {
    const result = track({}, {hasFocus: () => true, visibilityState: 'visible'} as any) as AnalyticsEvent | undefined;
    const payload = result?.getEventCapturePayload?.()();

    expect(payload).toEqual(expect.objectContaining({
      current: 'focused',
    }));
  });
});
