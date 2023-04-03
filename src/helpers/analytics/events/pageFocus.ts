import { stateChange } from '@openstax/event-capture-client/events';
import { Document } from '@openstax/types/lib.dom';
import { AppState } from '../../../app/types';
import { AnalyticsEvent } from './event';

export const selector = (_state: AppState) => ({});

export const track = (
  _: ReturnType<typeof selector>,
  document: Document
): AnalyticsEvent | void => {
  const focus = document.hasFocus();
  const visible = document.visibilityState === 'visible';

  const current = focus
    ? 'focused'
    : visible
      ? 'visible'
      : 'background'
  ;

  return {
    getEventCapturePayload: () => stateChange({
      current,
      stateType: 'visibility',
    }),
  };
};
