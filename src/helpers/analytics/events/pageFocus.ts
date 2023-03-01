import { stateChange } from '@openstax/event-capture-client/events';
import { AppState } from '../../../app/types';
import { AnalyticsEvent } from './event';

export const selector = (_state: AppState) => ({});

export const track = (
  _: ReturnType<typeof selector>,
  focused: boolean
): AnalyticsEvent | void => {
  return {
    getEventCapturePayload: () => stateChange({
      current: focused ? 'focused' : 'unfocused',
      previous: focused ? 'unfocused' : 'focused',
      stateType: 'visibility',
    }),
  };
};
