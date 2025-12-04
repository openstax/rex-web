import { assertWindow } from './browser-assertions';

describe('assertWindow', () => {
  it('throws when window is undefined', () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;
    expect(() => assertWindow()).toThrow();
    global.window = originalWindow;
  });
});
