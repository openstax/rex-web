import { GetHighlightsSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { resetModules } from '../test/utils';
import createHighlightClient from './createHighlightClient';

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
});
