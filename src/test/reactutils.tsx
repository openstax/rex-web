import { Document, HTMLElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { ComponentType, ReactElement } from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';

// JSDom logs to console.error when an Error is thrown.
// Disable the console just in this instance, and re-enable after.
// See https://github.com/facebook/jest/pull/5267#issuecomment-356605468
export function expectError(message: string, fn: () => void) {
  const consoleError = jest.spyOn(console, 'error');
  consoleError.mockImplementation(() => { /* suppress jsdom logging to console */ });

  try {
    expect(fn).toThrow(message);
  } finally {
    consoleError.mockRestore();
  }
}
export function expectReactRenderError(message: string, Subject: ComponentType, container?: HTMLElement) {
  const consoleError = jest.spyOn(console, 'error');
  consoleError.mockImplementation(() => { /* suppress jsdom logging to console */ });
  let error = '';

  class ErrorBoundary extends React.Component<{}, {message?: string}> {
    constructor(props: {}) {
      super(props);
      this.state = {};
    }

    public componentDidCatch(e: any) {
      error = e.message;
      this.setState({message: e.message});
    }

    public render() {

      return this.state.message || <>{this.props.children}</>;
    }
  }

  const domContainer = container || document!.createElement('div');

  ReactDOM.render(
    <ErrorBoundary>
      <Subject />
    </ErrorBoundary>
  , domContainer);

  try {
    expect(error).toBe(message);
  } finally {
    consoleError.mockRestore();
  }
}

// Utility to handle nulls and SFCs
export function renderToDom<C extends ComponentType>(subject: ReactElement<C>, container?: HTMLElement) {

  const Wrapper = class extends Component {
    public render() {
      return subject;
    }
  };

  if (!document) {
    throw new Error('document is required to render to dom');
  }

  const domContainer = container || document.createElement('div');
  if (!domContainer.parentNode) { document.body.appendChild(domContainer); }

  let c: C;

  act(() => {
    c = ReactDOM.render<C>(<Wrapper />, domContainer) as C;
  });

  if (!c!) {
      throw new Error(`BUG: Component was not rendered`);
  }
  const node = ReactDOM.findDOMNode(c) as HTMLElement;

  return {
    node,
    root: domContainer as HTMLElement,
    tree: c,
    unmount: () => ReactDOM.unmountComponentAtNode(domContainer),
  };
}

export const makeFindByTestId = (instance: renderer.ReactTestInstance) =>
  (id: string) => instance.findByProps({'data-testid': id});

export const makeFindOrNullByTestId = (instance: renderer.ReactTestInstance) =>
  (id: string): renderer.ReactTestInstance | null => instance.findAllByProps({'data-testid': id})[0] || null;

export const makeEvent = () => ({
  preventDefault: jest.fn(),
});
export const makeInputEvent = (value: string) => ({
  currentTarget: {value},
  preventDefault: jest.fn(),
});

export const dispatchKeyDownEvent = ({
  element, key, code, shiftKey = false, altKey = false, target, view,
}: {
  key?: string,
  code?: string,
  element?: Document | HTMLElement,
  shiftKey?: boolean,
  altKey?: boolean,
  target?: HTMLElement,
  view?: Window,
}) => {
  const keyboardEvent = new KeyboardEvent('keydown', {
    bubbles: true, cancelable: true, key, code, shiftKey, altKey, view: (view || window),
  });
  if (target) {
    Object.defineProperty(keyboardEvent, 'target', { value: target });
  }
  return (element || window!.document).dispatchEvent(keyboardEvent);
};
