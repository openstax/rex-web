import { GoogleAnalyticsClient } from '../../gateways/googleAnalyticsClient';
import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import { assertWindow } from '../utils';
import { print } from './print';
import { Book } from './types';

describe('print', () => {
  let client: GoogleAnalyticsClient;
  let mockGa: any;
  let mockPrint: any;
  const window: Window = assertWindow();
  let originalLocation: any;
  const pathname: string = '/books/biology-2e/pages/1-review-questions';
  const book = { id: 'bookId', slug: 'biology-2e', content: 'fooobarcontent' } as any as Book;

  beforeEach(() => {
    client = googleAnalyticsClient;
    mockPrint = jest.fn();
    window.print = mockPrint;
    mockGa = jest.fn<UniversalAnalytics.ga, []>();
    window.ga = mockGa;

    originalLocation = window.location;
    delete window.location;

    client.setTrackingIds(['foo']);
    jest.resetAllMocks();
  });

  it('prints', async() => {
    window.location = {...originalLocation, pathname};
    await print(book, pathname);
    expect(mockPrint).toHaveBeenCalled();
  });

  it('with good pathname tracks to GA', async() => {
    window.location = {...originalLocation, pathname};
    await print(book, pathname);
    expect(mockGa).toHaveBeenCalledWith('tfoo.send', 'event', 'REX print', 'biology-2e', pathname);
  });

  it('with undefined pathname tracks to GA', async() => {
    window.location = {...originalLocation, pathname: undefined};
    await print(book, undefined);
    expect(mockGa).toHaveBeenCalledWith('tfoo.send', 'event', 'REX print', 'unknown');
  });
});
