import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import Sentry from '../../../helpers/Sentry';
import createTestStore from '../../../test/createTestStore';
import MessageProvider from '../../MessageProvider';
import { Store } from '../../types';
import { recordError } from '../actions';
import ErrorBoundary from './ErrorBoundary';

jest.mock('../../../helpers/Sentry', () => ({
  captureException: jest.fn().mockReturnValue('randomErrorId'),
}));

// tslint:disable-next-line:variable-name
const Buggy: React.SFC = () => {
  throw new Error('this is a bug');
};

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance;
  let store: Store;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
    consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation((msg) => msg);
  });
  afterEach(() => {
    consoleError.mockRestore();
  });

  it('matches snapshot', () => {
    const tree = renderer
      .create(<Provider store={store}>
        <MessageProvider>
          <ErrorBoundary>
            <Buggy />
          </ErrorBoundary>
        </MessageProvider>
      </Provider>)
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringMatching(/error occurred in the <Buggy> component/)
    );
    expect(Sentry.captureException).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(recordError({sentryErrorId: 'randomErrorId'}));
  });
});
