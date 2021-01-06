import { AppState } from '../../app/types';
import * as eventCapture from '../../gateways/eventCaptureClient';
import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import { mapEventType } from './bindEvents';
import { AnalyticsEvent } from './events/event';

describe('mapEventType', () => {
  const appState = {} as AppState;
  const selected = {};
  const gaPayload = {};
  const ecPayload = {};
  const param = 'asdf';
  let testEvent: {track: (selected: {}, param: string) => AnalyticsEvent, selector: (state: AppState) => ({})};
  let mapped: ReturnType<typeof mapEventType>;
  let trackGa: jest.SpyInstance;
  let trackEc: jest.SpyInstance;
  let track: jest.Mock;
  let selector: jest.Mock;
  let getEventCapturePayload: jest.Mock;
  let getGoogleAnalyticsPayload: jest.Mock;

  beforeEach(() => {
    getEventCapturePayload = jest.fn();
    getGoogleAnalyticsPayload = jest.fn();
    selector = jest.fn();
    track = jest.fn().mockReturnValue({getEventCapturePayload, getGoogleAnalyticsPayload});
    testEvent = {selector, track};

    trackGa = jest.spyOn(googleAnalyticsClient, 'trackEventPayload')
      .mockReturnValue(undefined);
    trackEc = jest.spyOn(eventCapture, 'captureEvent')
      .mockReturnValue(undefined);

    mapped = mapEventType(testEvent);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('bind', () => {
    it('works with state object', () => {
      const bound = mapped.bind(appState);
      selector.mockReturnValue(selected);
      getGoogleAnalyticsPayload.mockReturnValue(gaPayload);
      getEventCapturePayload.mockReturnValue(ecPayload);

      bound(param);

      expect(track).toHaveBeenCalledWith(selected, param);
      expect(selector).toHaveBeenCalledWith(appState);
      expect(trackGa).toHaveBeenCalledWith(gaPayload);
      expect(trackEc).toHaveBeenCalledWith(ecPayload);
    });

    it('works with state getter', () => {
      const bound = mapped.bind(() => appState);
      selector.mockReturnValue(selected);
      getGoogleAnalyticsPayload.mockReturnValue(gaPayload);
      getEventCapturePayload.mockReturnValue(ecPayload);

      bound(param);

      expect(track).toHaveBeenCalledWith(selected, param);
      expect(selector).toHaveBeenCalledWith(appState);
      expect(trackGa).toHaveBeenCalledWith(gaPayload);
      expect(trackEc).toHaveBeenCalledWith(ecPayload);
    });
  });

  describe('track', () => {
    it('tracks GA and EC', () => {
      getGoogleAnalyticsPayload.mockReturnValue(gaPayload);
      getEventCapturePayload.mockReturnValue(ecPayload);

      mapped.track(selected, param);

      expect(trackGa).toHaveBeenCalledWith(gaPayload);
      expect(trackEc).toHaveBeenCalledWith(ecPayload);
    });

    it('tracks only GA', () => {
      getGoogleAnalyticsPayload.mockReturnValue(gaPayload);
      track.mockReturnValue({getGoogleAnalyticsPayload});

      mapped.track(selected, param);

      expect(trackGa).toHaveBeenCalledWith(gaPayload);
      expect(trackEc).not.toHaveBeenCalled();
    });

    it('tracks only EC', () => {
      getEventCapturePayload.mockReturnValue(ecPayload);
      track.mockReturnValue({getEventCapturePayload});

      mapped.track(selected, param);

      expect(trackGa).not.toHaveBeenCalled();
      expect(trackEc).toHaveBeenCalledWith(ecPayload);
    });
  });
});
