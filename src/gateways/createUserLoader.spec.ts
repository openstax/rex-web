import { testAccountsUser } from '../test/mocks/userLoader';
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
});
