import { GoogleAnalyticsClient } from '../../gateways/googleAnalyticsClient';
import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import { assertWindow } from '../utils';
import { print } from './print';

describe('print', () => {
  let client: GoogleAnalyticsClient;
  let mockGa: any;
  let mockPrint: any;
  const window: Window = assertWindow();
  let originalLocation: any;
  const pathname: string = '/books/biology-2e/pages/1-review-questions';

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
    await print();
    expect(mockPrint).toHaveBeenCalled();
  });

  it('with good pathname tracks to GA', async() => {
    window.location = {...originalLocation, pathname};
    await print();
    expect(mockGa).toHaveBeenCalledWith('tfoo.send', 'event', 'REX print', 'biology-2e', pathname);
  });

  it('with undefined pathname tracks to GA', async() => {
    window.location = {...originalLocation, pathname: undefined};
    await print();
    expect(mockGa).toHaveBeenCalledWith('tfoo.send', 'event', 'REX print', 'unknown');
  });
});
