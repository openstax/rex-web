import { assertWindow } from '../app/utils';

interface Command {
  name: string;
  params: Array<any>;
}

class GoogleAnalyticsClient {

  private trackerNames: Array<string> = [];
  private pendingCommands: Array<Command> = [];

  private GA = assertWindow().ga;

  private saveCommandForLater(command: Command) {
    this.pendingCommands.push(command);
  }

  private flushPendingCommands() {
    for (let pendingCommand of this.pendingCommands) {
      this.commandEachTracker(pendingCommand);
    }
    this.pendingCommands = [];
  }

  private commandEachTracker(command: Command) {
    for (let trackerName of this.trackerNames) {
      this.GA(trackerName + '.' + command.name, ...command.params);
    }
  }

  private isReadyForCommands() {
    return (this.trackerNames.length > 0);
  }

  public ga(command_name: string, ...params: any[]) {
    let command = {name: command_name, params: params} as Command;

    // The client may not be fully initialized by the time the first
    // command comes in; in that case, save the command until that
    // initialization.

    if (this.isReadyForCommands()) {
      this.flushPendingCommands();
      this.commandEachTracker(command);
    }
    else {
      this.saveCommandForLater(command);
    }
  };

  public setUserId(id: string) {
    this.ga('set', 'userid', id);
  }

  public trackPageView(url: string) {
    this.ga('send', 'pageview', url);
  }

  public setTrackingIds(ids: Array<string>) {
    // Ignore tracking ID changes for the moment
    if (this.trackerNames.length > 0) { return; }

    for (let id of ids) {
      // Build a tracker for each ID, use the ID as the basis of the
      // tracker name (must be alphanumeric)
      let trackerName = 't' + id.replace(/-/g,'');
      this.trackerNames.push(trackerName);
      this.GA('create', id, 'auto', trackerName);
    }
  }

}

let singleton = new GoogleAnalyticsClient();

export { GoogleAnalyticsClient };
export default singleton;
