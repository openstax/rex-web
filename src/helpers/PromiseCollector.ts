export class PromiseCollector {
  private promises: Array<Promise<any>> = [];

  public add(promise: Promise<any>): void {
    this.promises.push(promise);
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
