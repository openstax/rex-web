import type * as Initialization from './initialization';

describe('analytics initialization', () => {
  let initialization: typeof Initialization;

  beforeEach(() => {
    jest.resetModules();
    initialization = require('./initialization');
  });

  it('waits for initialize', async() => {
    const callback = jest.fn();
    initialization.initialized().then(callback);

    await new Promise((resolve) => setImmediate(resolve));
    expect(callback).not.toHaveBeenCalled();

    initialization.initialize({isK12: true, enabled: false});

    await new Promise((resolve) => setImmediate(resolve));
    expect(callback).toHaveBeenCalledWith({isK12: true, enabled: false});
  });

  it('keeps the first settings', async() => {
    initialization.initialize({isK12: false, enabled: true});
    initialization.initialize({isK12: true, enabled: false});

    await expect(initialization.initialized()).resolves.toEqual({isK12: false, enabled: true});
  });
});
