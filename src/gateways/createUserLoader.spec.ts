import { testAccountsUser } from '../test/mocks/userLoader';
import { assertWindow } from '../app/utils';
import createUserLoader from './createUserLoader';

const mockFetch = (code: number, data: any) =>
  jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(data),
      status: code,
      text: () => Promise.resolve(data),
    })
  );

describe('userLoader', () => {
  const fetchBackup = fetch;
  let userLoader: ReturnType<typeof createUserLoader>;

  beforeEach(() => {
    userLoader = createUserLoader('url');
  });

  afterEach(() => {
    (global as any).fetch = fetchBackup;
  });

  describe('getCurrentUser', () => {
    describe('success', () => {
      it('gets user', async() => {
        (global as any).fetch = mockFetch(200, testAccountsUser);

        const user = await userLoader.getCurrentUser();
        expect(fetch).toHaveBeenCalledWith('url/api/user?always_200=true', {
          credentials: 'include',
        });
        expect(user).toEqual(testAccountsUser);
      });

      it('gets undefined if not logged in', async() => {
        (global as any).fetch = mockFetch(200, '{}');

        const user = await userLoader.getCurrentUser();
        expect(fetch).toHaveBeenCalledWith('url/api/user?always_200=true', {
          credentials: 'include',
        });
        expect(user).toEqual(undefined);
      });
    });

    it('throws for unexpected errors', async() => {
      (global as any).fetch = mockFetch(500, 'unexpected error');

      await expect(userLoader.getCurrentUser()).rejects.toThrow('Error response from Accounts 500: unexpected error');
      expect(fetch).toHaveBeenCalledWith('url/api/user?always_200=true', {
        credentials: 'include',
      });
    });
  });

  describe('getAuthorizedFetchConfig', () => {
    it('includes the Accounts cookie without a launch token', async() => {
      expect(await userLoader.getAuthorizedFetchConfig()).toEqual({credentials: 'include'});
    });

    describe('with an auth query param', () => {
      const locationBackup = assertWindow().location;

      const setSearch = (search: string) => {
        Object.defineProperty(assertWindow(), 'location', {
          writable: true,
          value: {...locationBackup, search},
        });
      };

      afterEach(() => {
        Object.defineProperty(assertWindow(), 'location', {writable: true, value: locationBackup});
      });

      it('sends the auth query token as a bearer token', async() => {
        setSearch('?auth=accounts-token');
        expect(await createUserLoader('url').getAuthorizedFetchConfig()).toEqual({
          headers: {Authorization: 'Bearer accounts-token'},
        });
      });

      it('prefers the launch token', async() => {
        setSearch('?auth=accounts-token');
        expect(await createUserLoader('url', 'launch-token').getAuthorizedFetchConfig()).toEqual({
          headers: {'X-Launch-Token': 'launch-token'},
        });
      });

      describe('removing auth from the url', () => {
        let replaceStateSpy: jest.Mock;
        const historyBackup = assertWindow().history.replaceState;

        beforeEach(() => {
          replaceStateSpy = jest.fn();
          Object.defineProperty(assertWindow().history, 'replaceState', {writable: true, value: replaceStateSpy});
        });

        afterEach(() => {
          Object.defineProperty(assertWindow().history, 'replaceState', {writable: true, value: historyBackup});
        });

        it('removes auth when there is a launch token', () => {
          setSearch('?auth=accounts-token&other=thing');
          createUserLoader('url', 'launch-token');
          expect(replaceStateSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(),
            assertWindow().location.pathname + '?other=thing'
          );
        });

        it('keeps auth without a launch token, so it survives a reload', () => {
          setSearch('?auth=accounts-token');
          createUserLoader('url');
          expect(replaceStateSpy).not.toHaveBeenCalled();
        });
      });

      it('ignores auth=embedded', async() => {
        setSearch('?auth=embedded');
        expect(await createUserLoader('url').getAuthorizedFetchConfig()).toEqual({credentials: 'include'});
      });
    });

    it('sends the launch token in the X-Launch-Token header', async() => {
      const launchUserLoader = createUserLoader('url', 'launch-token');
      expect(await launchUserLoader.getAuthorizedFetchConfig()).toEqual({
        headers: {'X-Launch-Token': 'launch-token'},
      });
    });
  });
});
