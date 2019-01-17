import { Element } from '@openstax/types/lib.dom';
import { ComponentType, ReactElement } from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
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

// Utility to handle nulls
export function renderToDom<C extends ComponentType<{}>>(component: ReactElement<C>) {
    const c = ReactTestUtils.renderIntoDocument(component) as C;
    if (!c) {
        throw new Error(`BUG: Component was not rendered`);
    }
    const node = ReactDOM.findDOMNode(c) as Element;
    if (!node || !node.parentNode) {
        throw new Error(`BUG: Could not find DOM node`);
    }
    return {
      component: c,
      node,
      root: node.parentNode,
    };
}
