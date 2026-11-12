import createRequestAuth from './createRequestAuth';

describe('createRequestAuth', () => {
  it('sends an auth token as a bearer token', async() => {
    expect(await createRequestAuth({type: 'auth', token: 'accounts-token'}).getAuthorizedFetchConfig()).toEqual({
      headers: {Authorization: 'Bearer accounts-token'},
    });
  });

  it('sends a launch token in the X-Launch-Token header', async() => {
    const launchToken = {tokenString: 'launch-token', tokenData: {sub: 'a_uuid'}};
    expect(await createRequestAuth({type: 'launchToken', launchToken}).getAuthorizedFetchConfig()).toEqual({
      headers: {'X-Launch-Token': 'launch-token'},
    });
  });

  it('includes the Accounts cookie otherwise', async() => {
    expect(await createRequestAuth({type: 'cookie'}).getAuthorizedFetchConfig()).toEqual({credentials: 'include'});
  });
});
