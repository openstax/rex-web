import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import Sentry from '../../../helpers/Sentry';
import createTestStore from '../../../test/createTestStore';
import MessageProvider from '../../MessageProvider';
import { Store } from '../../types';
import ErrorBoundary from './ErrorBoundary';

jest.mock('../../../helpers/Sentry', () => ({
  captureException: jest.fn(),
}));

// tslint:disable-next-line:variable-name
const Buggy: React.SFC = () => {
  throw new Error('this is a bug');
};

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance;
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
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
      .create(<MessageProvider><Provider store={store}>
          <ErrorBoundary><Buggy /></ErrorBoundary>
        </Provider></MessageProvider>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringMatching(/error occurred in the <Buggy> component/)
    );
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
