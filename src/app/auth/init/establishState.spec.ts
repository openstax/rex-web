import createTestServices from '../../../test/createTestServices';
import { testAccountsUser } from '../../../test/mocks/userLoader';
import { AppServices, MiddlewareAPI } from '../../types';
import { assertWindow } from '../../utils';
import { receiveLoggedOut, receiveUser } from '../actions';
import { formatUser, launchUser } from '../utils';
import establishState from './establishState';

describe('auth establishState', () => {
  let services: AppServices & MiddlewareAPI;

  beforeEach(() => {
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
      services.launchToken = {tokenString: 'token', tokenData: {sub: 'a_uuid'}};
    });

    it('dispatches the launched user without asking Accounts', async() => {
      services.userLoader.getCurrentUser = jest.fn(() => Promise.resolve(testAccountsUser));

      establishState(services);
      await Promise.resolve();

      expect(services.userLoader.getCurrentUser).not.toHaveBeenCalled();
      expect(services.dispatch).toHaveBeenCalledWith(receiveUser(launchUser));
    });

    it('gives analytics the token\'s subject as the user id', async() => {
      establishState(services);
      await Promise.resolve();

      expect(assertWindow().dataLayer).toContainEqual({user: {uuid: 'a_uuid'}});
    });

    it('tells analytics there is no user id when the token has no subject', async() => {
      services.launchToken = {tokenString: 'token', tokenData: {}};
      establishState(services);
      await Promise.resolve();

      expect(assertWindow().dataLayer).toContainEqual({user: undefined});
      expect(services.dispatch).toHaveBeenCalledWith(receiveUser(launchUser));
    });
  });
});
