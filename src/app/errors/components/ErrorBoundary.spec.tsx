import React from 'react';
import renderer from 'react-test-renderer';
import Sentry from '../../../helpers/Sentry';
import TestContainer from '../../../test/TestContainer';
import { assertWindow } from '../../utils/browser-assertions';
import ErrorBoundary from './ErrorBoundary';

jest.mock('../../../helpers/Sentry', () => ({
  captureException: jest.fn(),
}));

// tslint:disable-next-line:variable-name
const Buggy = () => {
  throw new Error('this is a bug');
};

// tslint:disable-next-line:variable-name
const BuggyPromise = () => {
  const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
    promise: new Promise(() => null),
    reason: 'this is a bug',
  });

  const window = assertWindow();
  window.onunhandledrejection!(rejectionEvent);
  return null;
};

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation((msg) => msg);
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
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringMatching(/error occurred in the <Buggy> component/)
    );
    expect(Sentry.captureException).toHaveBeenCalled();
  });

  it('captures unhandled rejected promises', () => {
    renderer.create(<TestContainer>
      <ErrorBoundary><BuggyPromise /></ErrorBoundary>
    </TestContainer>);

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringMatching(/error occurred in the <BuggyPromise> component/)
    );
    expect(Sentry.captureException).toHaveBeenCalled();

  });
});
