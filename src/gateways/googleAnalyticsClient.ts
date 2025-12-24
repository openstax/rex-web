import flow from 'lodash/fp/flow';
import identity from 'lodash/fp/identity';
import isEmpty from 'lodash/fp/isEmpty';
import pickBy from 'lodash/fp/pickBy';
import { assertWindow, referringHostName } from '../app/utils';
import { trackingIsDisabled } from '../helpers/analytics';

interface EventPayload {
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  nonInteraction?: boolean;
}

interface GtagEventPayload extends Gtag.EventParams {
  non_interaction?: boolean;
  queue_time?: number;
}

interface EventCommand {
  name: 'event';
  eventName: string;
  payload: GtagEventPayload;
}

interface PageViewCommand extends EventCommand {
  name: 'event';
  eventName: 'page_view';
  payload: GtagEventPayload & {
    page_path: string;
  };
}

interface SetCommand {
  name: 'set';
  payload: SetPayload;
}

interface SetPayload {
  dimension3?: string | undefined;
  campaignSource?: string | undefined;
  campaignMedium?: string | undefined;
  campaignName?: string | undefined;
  campaignId?: string | undefined;
  campaignKeyword?: string | undefined;
  campaignContent?: string | undefined;
}

interface ConfigCommand {
  name: 'config';
  payload: Gtag.ConfigParams & {
    user_id?: string;
    send_page_view?: boolean;
    groups?: string;
  };
}

type Command = SetCommand | EventCommand | PageViewCommand | ConfigCommand;

interface Query {[key: string]: string; }

type Tag = {
  id: string;
  ignoredEventNames: string[];
};

class PendingCommand {
  public command: Command;
  public savedAt: Date;

  constructor(command: Command, savedAt: Date = new Date()) {
    this.command = command;
    this.savedAt = savedAt;
  }

  public queueTime() {
    return (new Date()).getTime() - this.savedAt.getTime();
  }
}

const mapUTMFieldNames = (query: Query): SetPayload => ({
  campaignContent: query.utm_content,
  campaignId: query.utm_id,
  campaignKeyword: query.utm_term,
  campaignMedium: query.utm_medium,
  campaignName: query.utm_campaign,
  campaignSource: query.utm_source,
});

// A Campaign ID is used as a shorthand for source, name, and medium.  (you have to
// tell GA through the console what this mapping is). When the ID is specified, you
// can override any of these values in this mapping by explicitly setting one or more
// of source, name, or medium.
// Ref: https://developers.google.com/analytics/solutions/data-import-campaign#tag
//
// When a Campaign ID is not set, Google says that "When you add parameters to
// a URL, you should always use utm_source, utm_medium, and utm_campaign."  What they
// mean is that you must set at least medium and source otherwise none of them are
// recorded. Ref: https://support.google.com/analytics/answer/1033863?hl=en
//
// We don't always have real values to put in both fields, so here we provide
// defaults for the missing one when the campaign ID is not set.
const defaultCampaignFields = (payload: SetPayload): SetPayload => {
  const defaults = {campaignSource: 'unset', campaignMedium: 'unset'};

  if (!payload.campaignId && (payload.campaignSource || payload.campaignMedium)) {
    return {...defaults, ...payload};
  }

  return payload;
};

export const campaignFromQuery: (query: Query) => SetPayload = flow(
  mapUTMFieldNames,
  pickBy(identity),
  defaultCampaignFields
);

const GA4_IGNORED_EVENT_NAMES = [
  'page_view',
];

// Only GA4 properties have a "G-" ID. https://support.google.com/analytics/answer/9539598
export const isGA4 = (id: Tag['id']) => id.startsWith('G-');

export const createTag = (id: Tag['id']): Tag => ({
  id,
  ignoredEventNames: isGA4(id) ? GA4_IGNORED_EVENT_NAMES : [],
});

class GoogleAnalyticsClient {
  private tags: Tag[] = [];
  private pendingCommands: PendingCommand[] = [];

  public gaProxy(command: Command) {
    if (isEmpty(command.payload)) {
      return;
    }

    if (this.isReadyForCommands()) {
      this.executeCommand(command);
    } else {
      this.saveCommandForLater(command);
    }
  }

  public getPendingCommands(): ReadonlyArray<PendingCommand> {
    return this.pendingCommands;
  }

  public setUserId(id: string) {
    // https://developers.google.com/analytics/devguides/collection/gtagjs/cookies-user-id#set_user_id
    this.gaProxy({ name: 'config', payload: { user_id: id, send_page_view: false }});
  }

  public setCustomDimensionForSession() {
    this.gaProxy({ name: 'set', payload: {
      dimension3: referringHostName(assertWindow())},
    });
  }

  public unsetUserId() {
    this.gaProxy({ name: 'config', payload: { user_id: undefined, send_page_view: false } });
  }

  public trackPageView(path: string, query = {}) {
    this.gaProxy({ name: 'set', payload: campaignFromQuery(query) });
    this.gaProxy({ name: 'event', eventName: 'page_view', payload: { page_path: path }});
  }

  public trackEventPayload(payload: EventPayload) {
    const eventPayload: GtagEventPayload = {
      event_category: payload.eventCategory,
      event_label: payload.eventLabel,
      non_interaction: payload.nonInteraction,
      value: payload.eventValue,
    };

    this.gaProxy({ name: 'event', eventName: payload.eventAction, payload: eventPayload });
  }

  public setTagIds(ids: string[]) {
    // Ignore tracking ID changes for the moment
    if (this.tags.length > 0 || trackingIsDisabled()) { return; }

    for (const id of ids) {
      this.tags.push(createTag(id));
      this.gtag('config', id, {
        send_page_view: false,
        transport_type: 'beacon',
      });
    }

    this.flushPendingCommands();
  }

  private saveCommandForLater(command: Command) {
    this.pendingCommands.push(new PendingCommand(command));
  }

  private flushPendingCommands() {
    for (const pendingCommand of this.pendingCommands) {
      this.executeCommand(pendingCommand.command, pendingCommand.queueTime());
    }
    this.pendingCommands = [];
  }

  private executeCommand(command: Command, queueTime = 0) {
    if (command.name === 'set') {
      this.gtag('set', undefined, command.payload);
      return;
    }

    for (const tag of this.tags) {
      command.payload = {...command.payload, queue_time: queueTime };

      if (command.name === 'event') {
        if (!tag.ignoredEventNames.includes(command.eventName)) {
          this.gtag('event', command.eventName, { ...command.payload, send_to: tag.id });
        }
      } else {
        this.gtag(command.name, tag.id, command.payload);
      }
    }
  }

  private isReadyForCommands() {
    return (this.tags.length > 0 && !trackingIsDisabled());
  }

  // The real, low-level Google Analytics gtag function
  private gtag(commandName: string, ...params: [string?, object?]) {
    return assertWindow().gtag(commandName, ...params);
  }

}

const singleton = new GoogleAnalyticsClient();

export { GoogleAnalyticsClient };
export default singleton;
