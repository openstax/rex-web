import createConsentClient from './createConsentClient';

const mockFetch = (status: number, data: any) =>
  jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(data),
      status,
      text: () => Promise.resolve(JSON.stringify(data)),
    })
  );

describe('createConsentClient', () => {
  const fetchBackup = fetch;
  const getAuthorizedFetchConfig = () => Promise.resolve({headers: {'X-Launch-Token': 'launch-token'}});
  const client = createConsentClient('https://consent.example/consent', getAuthorizedFetchConfig);

  afterEach(() => {
    (global as any).fetch = fetchBackup;
  });

  describe('getConsentPreferences', () => {
    it('reads consent preferences with the launch token', async() => {
      (global as any).fetch = mockFetch(200, {accepted: ['analytics'], rejected: ['advertisement']});

      expect(await client.getConsentPreferences()).toEqual({accepted: ['analytics'], rejected: ['advertisement']});
      expect(fetch).toHaveBeenCalledWith('https://consent.example/consent', {
        headers: {'X-Launch-Token': 'launch-token'},
      });
    });

    it('fills in missing lists', async() => {
      (global as any).fetch = mockFetch(200, {accepted: ['analytics']});
      expect(await client.getConsentPreferences()).toEqual({accepted: ['analytics'], rejected: []});
    });

    it('throws for error responses', async() => {
      (global as any).fetch = mockFetch(401, 'nope');
      await expect(client.getConsentPreferences()).rejects.toThrow('Error response from consent endpoint 401');
    });
  });

  describe('updateConsentPreferences', () => {
    it('posts consent preferences with the launch token', async() => {
      (global as any).fetch = mockFetch(200, {});

      await client.updateConsentPreferences({accepted: ['analytics'], rejected: []});

      expect(fetch).toHaveBeenCalledWith('https://consent.example/consent', {
        body: JSON.stringify({accepted: ['analytics'], rejected: []}),
        headers: {'Content-Type': 'application/json', 'X-Launch-Token': 'launch-token'},
        method: 'POST',
      });
    });

    it('throws for error responses', async() => {
      (global as any).fetch = mockFetch(500, 'broken');
      await expect(client.updateConsentPreferences({accepted: [], rejected: []}))
        .rejects.toThrow('Error response from consent endpoint 500');
    });
  });
});
