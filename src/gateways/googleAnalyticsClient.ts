// tslint:disable:max-classes-per-file
import { assertWindow, referringHostName } from '../app/utils';

interface PageView {
  hitType: 'pageview';
  page: string;
}

interface Event {
  hitType: 'event';
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  nonInteraction?: boolean;
  transport: 'beacon';
}

interface SendCommand {
  name: 'send';
  payload: PageView | Event;
}

interface SetCommand {
  name: 'set';
  payload: SetPayload;
}

interface SetPayload {
  userId?: string | undefined;
  dimension3?: string | undefined;
  campaignSource?: string | undefined;
  campaignMedium?: string | undefined;
  campaignName?: string | undefined;
  campaignId?: string | undefined;
  campaignKeyword?: string | undefined;
  campaignContent?: string | undefined;
}

type Command = SetCommand | SendCommand;

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

class CampaignData {
  readonly source: string | undefined;
  readonly name: string | undefined;
  readonly medium: string | undefined;
  readonly id: string | undefined;
  readonly keyword: string | undefined;
  readonly content: string| undefined;

  constructor(query: { [key: string]: string; }) {
    this.source = query["utm_source"];
    this.name = query["utm_campaign"];
    this.medium = query["utm_medium"];
    this.id = query["utm_id"];
    this.keyword = query["utm_term"];
    this.content = query["utm_content"];

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
    // We don't always have real values to put in all three fields, so here we provide
    // defaults for the missing ones when the campaign ID is not set.

    if (!this.id && (this.source || this.medium)) {
      this.source = this.source || "unset";
      this.medium = this.medium || "unset";
    }
  }

  public asSetCommands(): ReadonlyArray<Command> {
    let payloads: SetPayload[] = [];

    if (this.id) payloads.push({campaignId: this.id});
    if (this.source) payloads.push({campaignSource: this.source});
    if (this.medium) payloads.push({campaignMedium: this.medium});
    if (this.name) payloads.push({campaignName: this.name});
    if (this.keyword) payloads.push({campaignKeyword: this.keyword});
    if (this.content) payloads.push({campaignContent: this.content});

    return payloads.map((payload: SetPayload) => {
      return {name: 'set', payload: payload};
    });
  }
}

class GoogleAnalyticsClient {
  private trackerNames: string[] = [];
  private pendingCommands: PendingCommand[] = [];

  public gaProxy(command: Command) {
    if (this.isReadyForCommands()) {
      this.commandEachTracker(command);
    } else {
      this.saveCommandForLater(command);
    }
  }

  public bulkGaProxy(commands: ReadonlyArray<Command>) {
    commands.forEach((command: Command) => { this.gaProxy(command) });
  }

  public getPendingCommands(): ReadonlyArray<PendingCommand> {
    return this.pendingCommands;
  }

  public setUserId(id: string) {
    this.gaProxy({name: 'set', payload: {userId: id}});
  }

  public setCustomDimensionForSession() {
    this.gaProxy({name: 'set', payload: {
      dimension3: referringHostName(assertWindow())},
    });
  }

  public unsetUserId() {
    this.gaProxy({name: 'set', payload: {userId: undefined}});
  }

  public trackPageView(path: string, query = {}) {
    this.bulkGaProxy((new CampaignData(query).asSetCommands()));

    this.gaProxy({name: 'send', payload: {
      hitType: 'pageview',
      page: path,
    }});
  }

  public trackEventPayload(payload: Omit<Event, 'hitType' | 'transport'>) {
    this.gaProxy({name: 'send', payload: {
      ...payload,
      hitType: 'event',
      transport: 'beacon',
    }});
  }

  public trackEvent(
    eventCategory: string,
    eventAction: string,
    eventLabel?: string,
    eventValue?: number,
    nonInteraction?: boolean
  ) {
    this.trackEventPayload({
      eventAction,
      eventCategory,
      eventLabel,
      eventValue,
      nonInteraction,
    });
  }

  public setTrackingIds(ids: string[]) {
    // Ignore tracking ID changes for the moment
    if (this.trackerNames.length > 0) { return; }

    for (const id of ids) {
      // Build a tracker for each ID, use the ID as the basis of the
      // tracker name (must be alphanumeric)
      const trackerName = 't' + id.replace( /[^a-z0-9]+/ig, '' );
      this.trackerNames.push(trackerName);
      this.ga('create', id, 'auto', trackerName);
    }

    this.flushPendingCommands();
  }

  private saveCommandForLater(command: Command) {
    this.pendingCommands.push(new PendingCommand(command));
  }

  private flushPendingCommands() {
    for (const pendingCommand of this.pendingCommands) {
      this.commandEachTracker(pendingCommand.command, pendingCommand.queueTime());
    }
    this.pendingCommands = [];
  }

  private commandEachTracker(command: Command, queueTime: number = 0) {
    for (const trackerName of this.trackerNames) {
      this.ga(trackerName + '.set', 'queueTime', queueTime);
      this.ga(trackerName + '.' + command.name, command.payload);
    }
  }

  private isReadyForCommands() {
    return (this.trackerNames.length > 0);
  }

  // The real, low-level Google Analytics function
  private ga(commandName: string, ...params: any[]) {
    return assertWindow().ga(commandName, ...params);
  }

}

const singleton = new GoogleAnalyticsClient();

export { GoogleAnalyticsClient, CampaignData as GoogleAnalyticsCampaignData };
export default singleton;
