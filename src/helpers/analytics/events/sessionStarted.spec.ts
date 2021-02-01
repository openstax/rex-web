import * as events from '@openstax/event-capture-client/events';
import { AppState } from '../../../app/types';
import { selector, track } from './sessionStarted';

describe('sessionStarted', () => {
  it('selects nothing (placeholder)', () => {
    expect(selector({} as AppState)).toEqual({});
  });

  describe('creates event capture payload', () => {
    it('reports referrer', () => {
      const result = track({});
      const factory = jest.spyOn(events, 'sessionStarted');

      if (!result) {
        return expect(result).toBeTruthy();
      } else if (!result.getEventCapturePayload) {
        return expect(result.getEventCapturePayload).toBeTruthy();
      }

      result.getEventCapturePayload();

      expect(factory).toHaveBeenCalledWith();
    });
  });
});
