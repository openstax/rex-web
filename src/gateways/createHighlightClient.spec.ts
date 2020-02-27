import { GetHighlightsSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { resetModules } from '../test/utils';
import createHighlightClient, { DoNotHandleMe } from './createHighlightClient';

describe('createHighlightClient', () => {
  const fetchBackup = fetch;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    resetModules();
    fetchSpy = (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          data: [],
          meta: {
            count: 0,
            page: 1,
            per_page: 100,
            total_count: 0,
          },
        }),
        status: 200,
      })
    );
  });

  afterEach(() => {
    (global as any).fetch = fetchBackup;
  });

  it('calls fetch with the baseurl', async() => {
    const client = createHighlightClient('asdf');

    await client.getHighlights({
      perPage: 100,
      scopeId: 'scope',
      sourceIds: ['source'],
      sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
    });

    expect(fetchSpy.mock.calls[0][0]).toMatchInlineSnapshot(
      `"asdf/highlights?source_type=openstax_page&scope_id=scope&source_ids=source&per_page=100"`
    );
  });

  it('format error if response status is equal to 422', async() => {
    fetchSpy = (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        json: async() => Promise.resolve({
          messages: ['msg1', 'msg2'],
        }),
        status: 422,
        statusText: 'Some error',
      })
    );

    const client = createHighlightClient('asdf');

    await expect(client.getHighlights({
      perPage: 100,
      scopeId: 'scope',
      sourceIds: ['source'],
      sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
    })).rejects.toEqual('Some error: msg1, msg2');
  });

  it('reject with DoNotHandleMe if response status is 401', async() => {
    fetchSpy = (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        status: 401,
      })
    );

    const client = createHighlightClient('asdf');

    await expect(client.getHighlights({
      perPage: 100,
      scopeId: 'scope',
      sourceIds: ['source'],
      sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
    })).rejects.toBeInstanceOf(DoNotHandleMe);
  });
});
