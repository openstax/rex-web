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
  payload: {
    userId?: string | undefined;
    dimension3?: string | undefined;
  };
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

  public trackPageView(path: string) {
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

export { GoogleAnalyticsClient };
export default singleton;
