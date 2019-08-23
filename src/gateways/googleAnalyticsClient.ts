import { assertWindow } from '../app/utils';

interface Command {
  name: string;
  params: Array<any>;
}

class PendingCommand {
  command: Command;
  savedAt: Date;

  constructor(command: Command, savedAt: Date = new Date()) {
    this.command = command;
    this.savedAt = savedAt;
  }

  public queueTime() {
    return (new Date()).getTime() - this.savedAt.getTime();
  }
}

class GoogleAnalyticsClient {

  private trackerNames: Array<string> = [];
  private pendingCommands: Array<PendingCommand> = [];

  private saveCommandForLater(command: Command) {
    this.pendingCommands.push(new PendingCommand(command));
  }

  private flushPendingCommands() {
    for (let pendingCommand of this.pendingCommands) {
      this.commandEachTracker(pendingCommand.command, pendingCommand.queueTime());
    }
    this.pendingCommands = [];
  }

  private commandEachTracker(command: Command, queueTime: number = 0) {
    for (const trackerName of this.trackerNames) {
      this.ga(trackerName + '.' + 'set', 'queueTime', queueTime);
      this.ga(trackerName + '.' + command.name, ...command.params);
    }
  }

  private isReadyForCommands() {
    return (this.trackerNames.length > 0);
  }

  // The real, low-level Google Analytics function
  private ga(command_name: string, ...params: any[]) {
    return assertWindow().ga(command_name, ...params);
  }

  public gaProxy(command_name: string, ...params: any[]) {
    let command = {name: command_name, params: params} as Command;

    if (this.isReadyForCommands()) {
      this.commandEachTracker(command);
    }
    else {
      this.saveCommandForLater(command);
    }
  };

  public setUserId(id: string) {
    this.gaProxy('set', 'userid', id);
  }

  public trackPageView(path: string) {
    this.gaProxy('send', 'pageview', path);
  }

  public setTrackingIds(ids: Array<string>) {
    // Ignore tracking ID changes for the moment
    if (this.trackerNames.length > 0) { return; }

    for (const id of ids) {
      // Build a tracker for each ID, use the ID as the basis of the
      // tracker name (must be alphanumeric)
      let trackerName = 't' + id.replace(/-/g,'');
      this.trackerNames.push(trackerName);
      this.ga('create', id, 'auto', trackerName);
    }

    this.flushPendingCommands();
  }

}

const singleton = new GoogleAnalyticsClient();

export { GoogleAnalyticsClient };
export default singleton;
