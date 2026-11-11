import { assertWindow } from '../app/utils';
import createRequestAuth from './createRequestAuth';

describe('createRequestAuth', () => {
  describe('getAuthorizedFetchConfig', () => {
    it('includes the Accounts cookie without a launch token', async() => {
      expect(await createRequestAuth().getAuthorizedFetchConfig()).toEqual({credentials: 'include'});
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
        expect(await createRequestAuth().getAuthorizedFetchConfig()).toEqual({
          headers: {Authorization: 'Bearer accounts-token'},
        });
      });

      it('prefers the launch token', async() => {
        setSearch('?auth=accounts-token');
        expect(await createRequestAuth('launch-token').getAuthorizedFetchConfig()).toEqual({
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
          createRequestAuth('launch-token');
          expect(replaceStateSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(),
            assertWindow().location.pathname + '?other=thing'
          );
        });

        it('keeps auth without a launch token, so it survives a reload', () => {
          setSearch('?auth=accounts-token');
          createRequestAuth();
          expect(replaceStateSpy).not.toHaveBeenCalled();
        });
      });

      it('ignores auth=embedded', async() => {
        setSearch('?auth=embedded');
        expect(await createRequestAuth().getAuthorizedFetchConfig()).toEqual({credentials: 'include'});
      });
    });

    it('sends the launch token in the X-Launch-Token header', async() => {
      expect(await createRequestAuth('launch-token').getAuthorizedFetchConfig()).toEqual({
        headers: {'X-Launch-Token': 'launch-token'},
      });
    });
  });
});
