import React from 'react';
import renderer from 'react-test-renderer';
import Sentry from '../../../helpers/Sentry';
import TestContainer from '../../../test/TestContainer';
import { assertWindow } from '../../utils/browser-assertions';
import ErrorBoundary from './ErrorBoundary';

jest.mock('../../../helpers/Sentry', () => ({
  captureException: jest.fn(),
}));

const Buggy = () => {
  throw new Error('this is a bug');
};

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance;
  let rejectionEvent: CustomEvent;

  beforeEach(() => {
    consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation((msg) => msg);

    rejectionEvent = new CustomEvent('unhandledrejection', { cancelable: true });
    Object.defineProperty(rejectionEvent, 'reason', { value: 'a bug' });
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('matches snapshot', () => {
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2021);
    const tree = renderer
      .create(<TestContainer>
          <ErrorBoundary><Buggy /></ErrorBoundary>
        </TestContainer>
    );

    expect(tree.toJSON()).toMatchSnapshot();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringMatching(/error occurred in the <Buggy> component/)
    );
    expect(Sentry.captureException).toHaveBeenCalled();

    tree.unmount();
  });

  it('captures unhandled rejected promises', () => {
    const tree = renderer.create(<TestContainer>
      <ErrorBoundary handlePromiseRejection>test</ErrorBoundary>
    </TestContainer>);

    assertWindow().dispatchEvent(rejectionEvent);
    expect(tree).toMatchSnapshot();
    expect(rejectionEvent.defaultPrevented).toBe(true);
    expect(Sentry.captureException).toHaveBeenCalled();

    tree.unmount();
  });
});
