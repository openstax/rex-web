import * as Utils from '../app/utils';
import * as analyticsUtils from '../helpers/analytics/utils';
import { campaignFromQuery, createTag, GoogleAnalyticsClient, isGA4 } from './googleAnalyticsClient';

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

describe('isGA4', () => {
  it('distinguishes between GA4 and non-GA4 ids', () => {
    expect(isGA4('G-someid')).toBe(true);
    expect(isGA4('Gsomeid')).toBe(false);
    expect(isGA4('UA-someid')).toBe(false);
  });
});

describe('createTag', () => {
  it('creates a tag', () => {
    const tag = createTag('UA-someid');
    expect(tag).toEqual({ id: 'UA-someid', ignoredEventNames: [] });
  });

  it('sets ignoredEventNames when the id is a GA4 id', () => {
    const tag = createTag('G-someid');
    expect(tag).toEqual({ id: 'G-someid', ignoredEventNames: ['page_view'] });
  });
});

describe('GoogleAnalyticsClient', () => {
  let client: GoogleAnalyticsClient;
  let mockGtag: any;

  beforeEach(() => {
    client = new GoogleAnalyticsClient();
    mockGtag = jest.fn<Gtag.Gtag, []>();
    window.gtag = mockGtag;
  });

  describe('setUserId', () => {

    describe('called before tracking IDs set', () => {
      it('sets it after tracking IDs set', async() => {
        client.setUserId('jimbo');
        expect(mockGtag).not.toHaveBeenCalled();

        client.setTagIds(['foo', 'bar']);

        expect(mockGtag).toHaveBeenCalledWith('config', 'foo', {
          send_page_view: false,
          transport_type: 'beacon',
        });
        expect(mockGtag).toHaveBeenCalledWith('config', 'bar', {
          send_page_view: false,
          transport_type: 'beacon',
        });
        expect(mockGtag).toHaveBeenCalledWith('config', 'foo', {
          queue_time: expect.any(Number), send_page_view: false, user_id: 'jimbo',
        });
        expect(mockGtag).toHaveBeenCalledWith('config', 'bar', {
          queue_time: expect.any(Number), send_page_view: false, user_id: 'jimbo',
        });
      });
    });

    describe('called after tracking ID set', () => {
      it('sets it after tracking ID set', async() => {
        client.setTagIds(['foo']);
        client.setUserId('jimbo');
        expect(mockGtag).toHaveBeenCalledWith('config', 'foo', {
          queue_time: expect.any(Number),
          send_page_view: false,
          user_id : 'jimbo',
        });
      });
    });

  });

  describe('setCustomDimensionForSession', () => {
    describe('called before tracking IDs set', () => {
      it('doesnt call Ga', async() => {
        client.setCustomDimensionForSession();
        expect(mockGtag).not.toHaveBeenCalled();
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
      client.setTagIds(['foo', 'bar']);
      client.unsetUserId();
      expect(mockGtag).toHaveBeenCalledWith('config', 'foo', {
        queue_time: 0, send_page_view: false, user_id: undefined,
      });
      expect(mockGtag).toHaveBeenCalledWith('config', 'bar', {
        queue_time: 0, send_page_view: false, user_id: undefined,
      });
    });

  });

  describe('trackPageView', () => {

    describe('called before tracking ID set', () => {
      it('saves the commands and sends them after tag IDs set', async() => {
        client.trackPageView('/some/path');
        expect(mockGtag).not.toHaveBeenCalled();

        const sleepMs: number = 5;
        await sleep(sleepMs);

        expect(client.getPendingCommands().length).toBe(1);

        client.setTagIds(['foo']);
        expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
          page_path: '/some/path', queue_time: expect.any(Number), send_to: 'foo',
        });
        expect(mockGtag.mock.calls[1][2].queue_time).toBeGreaterThanOrEqual(sleepMs);

        expect(client.getPendingCommands().length).toBe(0);
      });

      it('doens\'t send and flush the commands if trackingIsDisabled is true', async() => {
        jest.spyOn(analyticsUtils, 'trackingIsDisabled').mockReturnValueOnce(true);

        client.trackPageView('/some/path');
        expect(mockGtag).not.toHaveBeenCalled();
        expect(client.getPendingCommands().length).toBe(1);

        client.setTagIds(['foo']);
        expect(mockGtag).not.toHaveBeenCalled();
        expect(mockGtag).not.toHaveBeenCalled();

        expect(client.getPendingCommands().length).toBe(1);
      });
    });

    describe('called after tracking IDs set', () => {
      it('sends them right away to all trackers', async() => {
        client.setTagIds(['foo', 'bar']);
        client.trackPageView('/some/path');
        expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
          page_path: '/some/path',
          queue_time: 0,
          send_to: 'foo',
        });
        expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
          page_path: '/some/path',
          queue_time: 0,
          send_to: 'bar',
        });
      });

      it('doesn\'t send them if trackingIsDisabled is true', async() => {
        jest.spyOn(analyticsUtils, 'trackingIsDisabled').mockReturnValueOnce(true);

        client.setTagIds(['foo', 'bar']);
        client.trackPageView('/some/path');
        expect(mockGtag).not.toHaveBeenCalled();
        expect(mockGtag).not.toHaveBeenCalled();
        expect(mockGtag).not.toHaveBeenCalled();
        expect(mockGtag).not.toHaveBeenCalled();
      });
    });

    describe('when campaign parameters are provided', () => {
      it('sends them', async() => {
        client.setTagIds(['foo']);
        mockGtag.mockClear();
        client.trackPageView('/some/path', { utm_source: 'source' });
        expect(mockGtag).toHaveBeenCalledWith('set', undefined, {
          campaignMedium: 'unset',
          campaignSource: 'source',
        });
      });
    });

    describe('when the tag is a GA4 id', () => {
      it('ignores the event', async() => {
        client.setTagIds(['G-foo', 'UA-foo']);
        mockGtag.mockClear();
        client.trackPageView('/some/path');
        expect(mockGtag).toHaveBeenNthCalledWith(1, 'event', 'page_view', {
          page_path: '/some/path', queue_time: expect.any(Number), send_to: 'UA-foo',
        });
      });
    });
  });

  describe('setTagIds', () => {

    describe('first call', () => {
      it('configs tags using the underlying gtag function', async() => {
        client.setTagIds(['foo', 'bar']);
        expect(mockGtag).toHaveBeenCalledWith('config', 'foo', {
          send_page_view: false,
          transport_type: 'beacon',
        });
        expect(mockGtag).toHaveBeenCalledWith('config', 'bar', {
          send_page_view: false,
          transport_type: 'beacon',
        });
      });
    });

    describe('second call', () => {
      beforeEach(() => {
        client.setTagIds(['foo', 'bar']);
        mockGtag.mockClear();
      });

      it('ignores tag changes', async() => {
        client.setTagIds(['xyz']);
        expect(mockGtag).not.toHaveBeenCalled();
      });
    });
  });

  describe('trackEvent', () => {
    beforeEach(() => {
      client.setTagIds(['foo']);
    });

    it('calls with category and action', async() => {
      client.trackEventPayload({
        eventAction: 'action', eventCategory: 'category',
      });
      expect(mockGtag).toHaveBeenCalledWith('event', 'action', {
        event_category: 'category',
        queue_time: 0,
        send_to: 'foo',
      });
    });

    it('calls with category, action, and label', async() => {
      client.trackEventPayload({
        eventAction: 'action', eventCategory: 'category', eventLabel: 'label',
      });
      expect(mockGtag).toHaveBeenCalledWith('event', 'action', {
        event_category: 'category',
        event_label: 'label',
        queue_time: 0,
        send_to: 'foo',
      });
    });

    it('calls with category, action, label, and value', async() => {
      client.trackEventPayload({
        eventAction: 'action',
        eventCategory: 'category',
        eventLabel: 'label',
        eventValue: 42,
      });
      expect(mockGtag).toHaveBeenCalledWith('event', 'action', {
        event_category: 'category',
        event_label: 'label',
        queue_time: 0,
        send_to: 'foo',
        value: 42,
      });
    });

    it('calls with category, action, label, value and non-interaction', async() => {
      client.trackEventPayload({
        eventAction: 'action',
        eventCategory: 'category',
        eventLabel: 'label',
        eventValue: 42,
        nonInteraction: true,
      });
      expect(mockGtag).toHaveBeenCalledWith('event', 'action', {
        event_category: 'category',
        event_label: 'label',
        non_interaction: true,
        queue_time: 0,
        send_to: 'foo',
        value: 42,
      });
    });
  });

});
