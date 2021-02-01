import * as Utils from '../app/utils';
import * as analytics from '../helpers/analytics';
import { campaignFromQuery, GoogleAnalyticsClient } from './googleAnalyticsClient';

declare const window: Window;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('campaignFromQuery', () => {
  describe('defaults', () => {
    it('provides defaults for medium medium when source set but ID is not', async() => {
      const data = campaignFromQuery({utm_source: 'foo'});
      expect(data.campaignSource).toEqual('foo');
      expect(data.campaignMedium).toEqual('unset');
    });

    it('provides no defaults for medium when ID and source are set', async() => {
      const data = campaignFromQuery({utm_source: 'foo', utm_id: 'bar'});
      expect(data.campaignMedium).toBeUndefined();
    });
  });

  it('returns all query campaign fields', async() => {
    const data = campaignFromQuery({
      utm_campaign: 'campaign',
      utm_content: 'content',
      utm_id: 'id',
      utm_medium: 'medium',
      utm_source: 'source',
      utm_term: 'term',
    });

    expect(data).toMatchObject({
      campaignContent: 'content',
      campaignId: 'id',
      campaignKeyword: 'term',
      campaignMedium: 'medium',
      campaignName: 'campaign',
      campaignSource: 'source',
    });
  });
});

describe('GoogleAnalyticsClient', () => {
  let client: GoogleAnalyticsClient;
  let mockGa: any;

  beforeEach(() => {
    client = new GoogleAnalyticsClient();
    mockGa = jest.fn<UniversalAnalytics.ga, []>();
    window.ga = mockGa;
  });

  describe('setUserId', () => {

    describe('called before tracking IDs set', () => {
      it('sets it after tracking IDs set', async() => {
        client.setUserId('jimbo');
        expect(mockGa).not.toHaveBeenCalled();
        client.setTrackingIds(['foo', 'bar']);
        expect(mockGa).toHaveBeenCalledWith('tfoo.set', {userId: 'jimbo'});
        expect(mockGa).toHaveBeenCalledWith('tbar.set', {userId: 'jimbo'});
      });
    });

    describe('called after tracking ID set', () => {
      it('sets it after tracking ID set', async() => {
        client.setTrackingIds(['foo']);
        client.setUserId('jimbo');
        expect(mockGa).toHaveBeenCalledWith('tfoo.set', {userId: 'jimbo'});
      });
    });

  });

  describe('setCustomDimensionForSession', () => {
    describe('called before tracking IDs set', () => {
      it('doesnt call Ga', async() => {
        client.setCustomDimensionForSession();
        expect(mockGa).not.toHaveBeenCalled();
      });
    });

    describe('calls utility function to get host name', () => {
      it('sends the custom dimension to ga', async() => {
        const testHostName = jest.spyOn(Utils,
          'referringHostName').mockReturnValueOnce('foobar');
        client.setCustomDimensionForSession();
        expect(testHostName).toBeCalledTimes(1);
      });
    });
  });

  describe('unsetUserId', () => {

    it('unsets it', async() => {
      client.setTrackingIds(['foo', 'bar']);
      client.unsetUserId();
      expect(mockGa).toHaveBeenCalledWith('tfoo.set', {userId: undefined});
      expect(mockGa).toHaveBeenCalledWith('tbar.set', {userId: undefined});
    });

  });

  describe('trackPageView', () => {

    describe('called before tracking ID set', () => {
      it('saves the commands and sends them after tracking IDs set', async() => {
        client.trackPageView('/some/path');
        expect(mockGa).not.toHaveBeenCalled();

        const sleepMs: number = 5;
        await sleep(sleepMs);

        expect(client.getPendingCommands().length).toBe(1);

        client.setTrackingIds(['foo']);
        expect(mockGa).toHaveBeenCalledWith('tfoo.set', 'queueTime', expect.any(Number));
        expect(mockGa.mock.calls[1][2]).toBeGreaterThanOrEqual(sleepMs);
        expect(mockGa).toHaveBeenCalledWith('tfoo.send', {hitType: 'pageview', page: '/some/path'});

        expect(client.getPendingCommands().length).toBe(0);
      });

      it('doens\'t send and flush the commands if trackingIsDisabled is true', async() => {
        jest.spyOn(analytics, 'trackingIsDisabled').mockReturnValueOnce(true);

        client.trackPageView('/some/path');
        expect(mockGa).not.toHaveBeenCalled();
        expect(client.getPendingCommands().length).toBe(1);

        client.setTrackingIds(['foo']);
        expect(mockGa).not.toHaveBeenCalled();
        expect(mockGa).not.toHaveBeenCalled();

        expect(client.getPendingCommands().length).toBe(1);
      });
    });

    describe('called after tracking IDs set', () => {
      it('sends them right away to all trackers', async() => {
        client.setTrackingIds(['foo', 'bar']);
        client.trackPageView('/some/path');
        expect(mockGa).toHaveBeenCalledWith('tfoo.set', 'queueTime', 0);
        expect(mockGa).toHaveBeenCalledWith('tfoo.send', {hitType: 'pageview', page: '/some/path'});
        expect(mockGa).toHaveBeenCalledWith('tbar.set', 'queueTime', 0);
        expect(mockGa).toHaveBeenCalledWith('tbar.send', {hitType: 'pageview', page: '/some/path'});
      });

      it('doesn\'t send them if trackingIsDisabled is true', async() => {
        jest.spyOn(analytics, 'trackingIsDisabled').mockReturnValueOnce(true);

        client.setTrackingIds(['foo', 'bar']);
        client.trackPageView('/some/path');
        expect(mockGa).not.toHaveBeenCalled();
        expect(mockGa).not.toHaveBeenCalled();
        expect(mockGa).not.toHaveBeenCalled();
        expect(mockGa).not.toHaveBeenCalled();
      });
    });

    describe('when campaign parameters are provided in the query', () => {
      it('sends them', async() => {
        client.setTrackingIds(['foo']);
        client.trackPageView('/some/path', { utm_source: 'source' });
        expect(mockGa).toHaveBeenCalledWith('tfoo.set', { campaignMedium: 'unset', campaignSource: 'source' });
      });
    });
  });

  describe('setTrackingIds', () => {

    describe('first call', () => {
      it('creates trackers using the underlying ga function', async() => {
        client.setTrackingIds(['foo', 'bar']);
        expect(mockGa).toHaveBeenCalledWith('create', 'foo', 'auto', 'tfoo');
        expect(mockGa).toHaveBeenCalledWith('create', 'bar', 'auto', 'tbar');
      });
    });

    describe('second call', () => {
      beforeEach(() => {
        client.setTrackingIds(['foo', 'bar']);
        mockGa.mockClear();
      });

      it('creates trackers using the underlying ga function', async() => {
        client.setTrackingIds(['xyz']);
        expect(mockGa).not.toHaveBeenCalled();
      });
    });

    describe('tracker name alphanumericalizing', () => {
      it('strips hyphens out of tracking IDs for tracker names', async() => {
        client.setTrackingIds(['ab--2']);
        expect(mockGa).toHaveBeenCalledWith('create', 'ab--2', 'auto', 'tab2');
      });
    });

  });

  describe('trackEvent', () => {
    beforeEach(() => {
      client.setTrackingIds(['foo']);
    });

    it('calls with category and action', async() => {
      client.trackEvent('category', 'action');
      expect(mockGa).toHaveBeenCalledWith('tfoo.send', {
        eventAction: 'action',
        eventCategory: 'category',
        hitType: 'event',
        transport: 'beacon',
      });
    });

    it('calls with category, action, and label', async() => {
      client.trackEvent('category', 'action', 'label');
      expect(mockGa).toHaveBeenCalledWith('tfoo.send', {
        eventAction: 'action',
        eventCategory: 'category',
        eventLabel: 'label',
        hitType: 'event',
        transport: 'beacon',
      });
    });

    it('calls with category, action, label, and value', async() => {
      client.trackEvent('category', 'action', 'label', 42);
      expect(mockGa).toHaveBeenCalledWith('tfoo.send', {
        eventAction: 'action',
        eventCategory: 'category',
        eventLabel: 'label',
        eventValue: 42,
        hitType: 'event',
        transport: 'beacon',
      });
    });

    it('calls with category, action, label, value and non-interaction', async() => {
      client.trackEvent('category', 'action', 'label', 42, true);
      expect(mockGa).toHaveBeenCalledWith('tfoo.send', {
        eventAction: 'action',
        eventCategory: 'category',
        eventLabel: 'label',
        eventValue: 42,
        hitType: 'event',
        nonInteraction: true,
        transport: 'beacon',
      });
    });
  });

});
