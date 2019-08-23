import { assertWindow } from '../app/utils';

interface Command {
  name: string;
  params: Array<any>;
}

class GoogleAnalyticsClient {

  private trackerNames: Array<string> = [];
  private pendingCommands: Array<Command> = [];

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

  // The real, low-level Google Analytics function
  private GA(command_name: string, ...params: any[]) {
    return assertWindow().ga(command_name, ...params);
  }

  public ga(command_name: string, ...params: any[]) {
    let command = {name: command_name, params: params} as Command;

    if (this.isReadyForCommands()) {
      this.commandEachTracker(command);
    }
    else {
      this.saveCommandForLater(command);
    }
  };

  public setUserId(id: string) {
    this.ga('set', 'userid', id);
  }

  public trackPageView(path: string) {
    this.ga('send', 'pageview', path);
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

    this.flushPendingCommands();
  }

}

let singleton = new GoogleAnalyticsClient();

export { GoogleAnalyticsClient };
export default singleton;
