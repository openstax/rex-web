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
        expect(fetch).toHaveBeenCalledWith('url/accounts/api/user', {
          credentials: 'include',
        });
        expect(user).toEqual(testAccountsUser);
      });

      it('gets undefined for 403 errors', async() => {
        (global as any).fetch = mockFetch(403, '');

        const user = await userLoader.getCurrentUser();
        expect(fetch).toHaveBeenCalledWith('url/accounts/api/user', {
          credentials: 'include',
        });
        expect(user).toEqual(undefined);
      });
    });

    it('gets undefined for unexpected errors', async() => {
      (global as any).fetch = mockFetch(500, 'unexpected error');

      const user = await userLoader.getCurrentUser();
      expect(fetch).toHaveBeenCalledWith('url/accounts/api/user', {
        credentials: 'include',
      });
      expect(user).toEqual(undefined);
    });
  });
});
