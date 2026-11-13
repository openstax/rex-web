import createTestServices from '../../../test/createTestServices';
import { testAccountsUser } from '../../../test/mocks/userLoader';
import { AppServices, MiddlewareAPI } from '../../types';
import { assertWindow } from '../../utils';
import { receiveLoggedOut, receiveUser } from '../actions';
import { formatUser } from '../utils';
import establishState from './establishState';

describe('auth establishState', () => {
  let services: AppServices & MiddlewareAPI;

  beforeEach(() => {
    // the test setup shares one dataLayer between tests
    assertWindow().dataLayer = [];
    services = {
      ...createTestServices(),
      dispatch: jest.fn(),
      getState: jest.fn(),
    };
  });

  it('dispatches authenticated user', async() => {
    services.userLoader.getCurrentUser = jest.fn(() => Promise.resolve(testAccountsUser));

    establishState(services);
    await Promise.resolve();

    expect(services.dispatch).toHaveBeenCalledWith(receiveUser(formatUser(testAccountsUser)));
  });

  it('dispatches logged out', async() => {
    services.userLoader.getCurrentUser = jest.fn(() => Promise.resolve(undefined));

    establishState(services);
    await Promise.resolve();

    expect(services.dispatch).toHaveBeenCalledWith(receiveLoggedOut());
  });

  describe('with a launch token', () => {
    beforeEach(() => {
      services.sessionCredential = {type: 'launchToken', launchToken: {tokenString: 'token', tokenData: {sub: 'a_uuid'}}};
    });

    it('dispatches the launched user without asking Accounts', async() => {
      services.userLoader.getCurrentUser = jest.fn(() => Promise.resolve(testAccountsUser));

      establishState(services);
      await Promise.resolve();

      expect(services.userLoader.getCurrentUser).not.toHaveBeenCalled();
      expect(services.dispatch).toHaveBeenCalledWith(receiveUser({source: 'launch', uuid: 'a_uuid'}));
    });

    it('gives analytics the token\'s subject as the user id', async() => {
      establishState(services);
      await Promise.resolve();

      expect(assertWindow().dataLayer).toContainEqual({user: {uuid: 'a_uuid'}});
    });
  });

  it('asks Accounts for the user in an auth session, even alongside a launch token', async() => {
    services.sessionCredential = {
      type: 'auth',
      token: 'accounts-token',
      launchToken: {tokenString: 'token', tokenData: {sub: 'a_uuid'}},
    };
    services.userLoader.getCurrentUser = jest.fn(() => Promise.resolve(testAccountsUser));

    establishState(services);
    await Promise.resolve();

    expect(services.userLoader.getCurrentUser).toHaveBeenCalled();
    expect(services.dispatch).toHaveBeenCalledWith(receiveUser(formatUser(testAccountsUser)));
  });
});
