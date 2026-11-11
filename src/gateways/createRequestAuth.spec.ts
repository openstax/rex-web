import createRequestAuth from './createRequestAuth';

describe('createRequestAuth', () => {
  describe('getAuthorizedFetchConfig', () => {
    it('includes the Accounts cookie without a launch token or auth param', async() => {
      expect(await createRequestAuth(undefined, '').getAuthorizedFetchConfig()).toEqual({credentials: 'include'});
    });

    it('sends the launch token in the X-Launch-Token header', async() => {
      expect(await createRequestAuth('launch-token', '').getAuthorizedFetchConfig()).toEqual({
        headers: {'X-Launch-Token': 'launch-token'},
      });
    });

    it('sends the auth query token as a bearer token', async() => {
      expect(await createRequestAuth(undefined, '?auth=accounts-token').getAuthorizedFetchConfig()).toEqual({
        headers: {Authorization: 'Bearer accounts-token'},
      });
    });

    it('prefers the launch token', async() => {
      expect(await createRequestAuth('launch-token', '?auth=accounts-token').getAuthorizedFetchConfig()).toEqual({
        headers: {'X-Launch-Token': 'launch-token'},
      });
    });

    it('ignores auth=embedded', async() => {
      expect(await createRequestAuth(undefined, '?auth=embedded').getAuthorizedFetchConfig())
        .toEqual({credentials: 'include'});
    });
  });
});
