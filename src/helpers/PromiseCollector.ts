export default class PromiseCollector {
  private _promises: Array<Promise<any>> = [];

  public get promises(): ReadonlyArray<Promise<any>> {
    return this._promises;
  }

  public add(promise: Promise<any>): void {
    this._promises.push(promise);
    // ignore thrown errors because we are forking to remove from the collection
    promise.catch(() => null).finally(() => {
      this._promises.splice(this._promises.indexOf(promise), 1);
    });
  }

  public calm(): Promise<void> {
    const count = this.promises.length;
    return Promise.all(this.promises)
      .then(() => {
        if (count !== this.promises.length) {
          return this.calm();
        }
      });
  }
}
