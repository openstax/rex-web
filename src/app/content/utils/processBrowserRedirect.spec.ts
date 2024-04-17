import createTestServices from '../../../test/createTestServices';
import { notFound } from '../../errors/routes';
import { AnyMatch } from '../../navigation/types';
import { AppServices } from '../../types';
import { assertWindow } from '../../utils';
import { processBrowserRedirect } from './processBrowserRedirect';

const mockFetch = (valueToReturn: any, error?: any) => () => new Promise((resolve, reject) => {
  if (error) {
    reject(error);
  }
  resolve({ json: () => new Promise((res) => res(valueToReturn)) });
});

describe('processBrowserRedirect', () => {
  let services: AppServices;
  let historyReplaceSpy: jest.SpyInstance;
  let fetchBackup: any;
  let window: Window;

  beforeEach(() => {
    window = assertWindow();
    services = createTestServices();
    delete (window as any).location;

    window.location = {
      origin: 'openstax.org',
    } as any as Window['location'];

    services.history.location = {
      pathname: '/books/physics/pages/1-introduction301',
    } as any;

    historyReplaceSpy = jest.spyOn(services.history, 'replace')
      .mockImplementation(jest.fn());

    fetchBackup = (globalThis as any).fetch;
  });

  afterEach(() => {
    (globalThis as any).fetch = fetchBackup;
  });

  it('calls history.replace if redirect is found', async() => {
    (globalThis as any).fetch = mockFetch([{ from: services.history.location.pathname, to: 'redirected' }]);

    const match = {route: {getUrl: jest.fn(() => 'url')}} as unknown as AnyMatch;
    jest.spyOn(services.router, 'findRoute').mockReturnValue(match);

    await processBrowserRedirect(services);

    expect(historyReplaceSpy).toHaveBeenCalledWith('redirected');
  });

  it('updates window.location if target is not within rex', async() => {
    (globalThis as any).fetch = mockFetch([{ from: services.history.location.pathname, to: '/redirected' }]);

    const match = {route: notFound, state: false} as unknown as AnyMatch;
    jest.spyOn(services.router, 'findRoute').mockReturnValue(match);

    await processBrowserRedirect(services);

    expect(window.location.href).toEqual('openstax.org/redirected');
  });
});