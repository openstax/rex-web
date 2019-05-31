import { Configuration, SearchApi } from '@openstax/open-search-client';
import createSearchClient from './createSearchClient';

jest.mock('@openstax/open-search-client');

describe('createSearchClient', () => {
  it('configures the basePath', () => {
    const url = 'asdf';

    createSearchClient(url);

    expect(Configuration).toBeCalledWith(expect.objectContaining({
      basePath: url,
    }));

    expect(SearchApi).toBeCalledWith(
      (Configuration as unknown as jest.SpyInstance<Configuration>).mock.instances[0]
    );
  });
});
