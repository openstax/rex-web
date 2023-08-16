import { GetHighlightsSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { UnauthenticatedError } from '../app/utils';
import { resetModules } from '../test/utils';
import createHighlightClient from './createHighlightClient';
import { ToastMesssageError } from '../helpers/applicationMessageError';
import Sentry from '../helpers/Sentry';

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

    expect(fetchSpy.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "asdf/highlights?source_type=openstax_page&scope_id=scope&source_ids=source&per_page=100",
        Object {
          "body": undefined,
          "credentials": undefined,
          "headers": Object {},
          "method": "GET",
        },
      ]
    `);
  });

  it('can be configured to get the authorizedFetchConfig from a function', async() => {
    const client = createHighlightClient('asdf', async() => ({
      headers: { Authorization: 'SomeToken' },
    }));

    await client.getHighlights({
      perPage: 100,
      scopeId: 'scope',
      sourceIds: ['source'],
      sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
    });

    expect(fetchSpy.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "asdf/highlights?source_type=openstax_page&scope_id=scope&source_ids=source&per_page=100",
        Object {
          "body": undefined,
          "credentials": undefined,
          "headers": Object {
            "Authorization": "SomeToken",
          },
          "method": "GET",
        },
      ]
    `);
  });

  it('format error if response status is equal to 422', async() => {
    fetchSpy = (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        json: async() =>
          Promise.resolve({
            messages: ['msg1', 'msg2'],
          }),
        status: 422,
        statusText: 'Some error',
      })
    );

    const client = createHighlightClient('asdf');

    await expect(
      client.getHighlights({
        perPage: 100,
        scopeId: 'scope',
        sourceIds: ['source'],
        sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
      })
    ).rejects.toEqual('Some error: msg1, msg2');
  });

  it('reject with UnauthenticatedError if response status is 401', async() => {
    fetchSpy = (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        status: 401,
      })
    );

    const client = createHighlightClient('asdf');

    await expect(
      client.getHighlights({
        perPage: 100,
        scopeId: 'scope',
        sourceIds: ['source'],
        sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
      })
    ).rejects.toBeInstanceOf(UnauthenticatedError);
  });

  it('throws ToastMessageError if network connection is flaky/offline', async() => {
    global.fetch = jest.fn(() =>
      Promise.reject(new TypeError('Failed to fetch'))
    );

    const client = createHighlightClient('asdf');

    await expect(
      client.getHighlights({
        perPage: 100,
        scopeId: 'scope',
        sourceIds: ['source'],
        sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
      })
    ).rejects.toBeInstanceOf(ToastMesssageError);
  });

  it('captures errors if something else went wrong with the fetch', async() => {
    const captureException = jest.spyOn(Sentry, 'captureException').mockImplementation(() => undefined);

    global.fetch = jest.fn(() =>
      Promise.reject('Internal Error')
    );

    const client = createHighlightClient('asdf');

    await expect(
      client.getHighlights({
        perPage: 100,
        scopeId: 'scope',
        sourceIds: ['source'],
        sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
      })
    ).rejects.toBeInstanceOf(ToastMesssageError);
    expect(captureException).toHaveBeenCalledWith('Internal Error');
  });
});
