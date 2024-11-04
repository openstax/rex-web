import imageCdnGateway from './createImageCDNUtils';

describe('createImageCDNUtils', () => {
  const fetchBackup = fetch;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = (global as any).fetch = jest.fn(() => Promise.resolve());
  });

  afterEach(() => {
    (global as any).fetch = fetchBackup;
  });

  it('prefetches when enabled', () => {
    const gateway = imageCdnGateway({prefetchResolutions: true});
    gateway.getOptimizedImageUrl('/apps/archive/some-image.jpg');
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://openstax.org/apps/image-cdn/v1/f=webp/apps/archive/some-image.jpg',
      {method: 'HEAD'}
    );
  });
});
