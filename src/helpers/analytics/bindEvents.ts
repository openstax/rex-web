import { AppState } from '../../app/types';
import { captureEvent } from '../../gateways/eventCaptureClient';
import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import * as clickButton from './events/clickButton';
import * as clickInput from './events/clickInput';
import * as clickLink from './events/clickLink';
import { AnalyticsEvent } from './events/event';
import * as highlightingCreateNote from './events/highlighting/createNote';
import * as deleteHighlight from './events/highlighting/delete';
import * as highlightingEditColor from './events/highlighting/editColor';
import * as highlightingEditAnnotation from './events/highlighting/editNote';
import * as showCreate from './events/highlighting/showCreate';
import * as showHelpInfo from './events/highlighting/showHelpInfo';
import * as showLogin from './events/highlighting/showLogin';
import * as openCloseMH from './events/highlighting/summaryPopup/openClose';
import * as openNudgeStudyTools from './events/openNudgeStudyTools';
import * as pageFocus from './events/pageFocus';
import * as openClosePracticeQuestions from './events/practiceQuestions/openClosePopUp';
import * as print from './events/print';
import * as search from './events/search';
import * as sessionStarted from './events/sessionStarted';
import * as closeStudyGuides from './events/studyGuides/closePopUp';
import * as openStudyGuides from './events/studyGuides/openPopUp';
import * as openUTG from './events/studyGuides/openUTG';
import * as unload from './events/unload';

type EventConstructor<Args extends any[] = any[]> = (...args: Args) => (AnalyticsEvent | void);
type Selector = (state: AppState) => object;
interface Event {track: EventConstructor; selector: Selector; }

const triggerEvent = <E extends Event>(event: E): E['track'] => (...args) => {
  const analyticsEvent = event.track(...args);

  if (analyticsEvent && analyticsEvent.getGoogleAnalyticsPayload) {
    googleAnalyticsClient.trackEventPayload(analyticsEvent.getGoogleAnalyticsPayload());
  }
  if (analyticsEvent && analyticsEvent.getEventCapturePayload) {
    captureEvent(analyticsEvent.getEventCapturePayload());
  }
};

const bindTrackSelector = <E extends Event>(event: E) => (state: AppState) =>  {
  type RemainingArgumentTypes = E['track'] extends (d: ReturnType<E['selector']>, ...args: infer A) => any ? A : never;

  return (...args: RemainingArgumentTypes) => {
    const data = event.selector(state);
    triggerEvent(event)(data, ...args);
  };
};

export const mapEventType = <E extends Event>(event: E) => ({
  ...event,
  bind: bindTrackSelector(event),
  track: triggerEvent(event),
});

export const events = {
  clickButton: mapEventType(clickButton),
  clickInput: mapEventType(clickInput),
  clickLink: mapEventType(clickLink),
  closeStudyGuides: mapEventType(closeStudyGuides),
  createNote: mapEventType(highlightingCreateNote),
  deleteHighlight: mapEventType(deleteHighlight),
  editAnnotation: mapEventType(highlightingEditAnnotation),
  editNoteColor: mapEventType(highlightingEditColor),
  openCloseMH: mapEventType(openCloseMH),
  openClosePracticeQuestions: mapEventType(openClosePracticeQuestions),
  openNudgeStudyTools: mapEventType(openNudgeStudyTools),
  openStudyGuides: mapEventType(openStudyGuides),
  openUTG: mapEventType(openUTG),
  pageFocus: mapEventType(pageFocus),
  print: mapEventType(print),
  search: mapEventType(search),
  sessionStarted: mapEventType(sessionStarted),
  showCreate: mapEventType(showCreate),
  showHelpInfo: mapEventType(showHelpInfo),
  showLogin: mapEventType(showLogin),
  unload: mapEventType(unload),
};
