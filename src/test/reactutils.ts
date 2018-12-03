import { ReactTestInstance } from 'react-test-renderer';

export const setStateFinished = (testInstance: ReactTestInstance) => new Promise((resolve) => {
  testInstance.instance.setState({}, resolve);
});

// JSDom logs to console.error when an Error is thrown.
// Disable the console just in this instance, and re-enable after.
// See https://github.com/facebook/jest/pull/5267#issuecomment-356605468
export function expectError(message: string, fn: () => void) {
  const consoleError = jest.spyOn(console, 'error');
  consoleError.mockImplementation(() => { /* suppress jsdom logging to console */ });

  try {
      fn();
      expect('Code should not have succeeded').toBeFalsy();
  } catch (err) {
      expect(err.message).toBe(message);
  } finally {
      consoleError.mockRestore();
  }
}
