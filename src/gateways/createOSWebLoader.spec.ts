import { AppServices } from '../app/types';
import { resetModules } from '../test/utils';
import { fields } from './createOSWebLoader';

const mockFetch = (code: number, data: any) => jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(data),
  status: code,
  text: () => Promise.resolve(data),
}));

describe('osWebLoader', () => {
  const fetchBackup = fetch;
  let osWebLoader: AppServices['osWebLoader'];

  beforeEach(() => {
    osWebLoader = require('./createOSWebLoader').default('url');
  });

  afterEach(() => {
    resetModules();
    (global as any).fetch = fetchBackup;
  });

  describe('getBookIdFromSlug', () => {

    describe('success', () => {
      beforeEach(() => {
        (global as any).fetch = mockFetch(200, {
          items: [{cnx_id: 'qwer', meta: {slug: 'asdf'}}],
          meta: {item_count: 1},
        });
      });

      it('gets book id', async() => {
        const id = await osWebLoader.getBookIdFromSlug('asdf');
        expect(fetch).toHaveBeenCalledWith(`url/v2/pages?type=books.Book&fields=${fields}&slug=asdf`);
        expect(id).toEqual('qwer');
      });
    });

    it('returns undefined for slugs without uuid', async() => {
      (global as any).fetch = mockFetch(200, {items: [], meta: {item_count: 0}});
      const uuid = await osWebLoader.getBookIdFromSlug('asdf');

      expect(uuid).toEqual(undefined);
    });

    it('throws on error', async() => {
      (global as any).fetch = mockFetch(404, 'not found');
      let message: string | undefined;

      try {
        await osWebLoader.getBookIdFromSlug('asdf');
      } catch (e: any) {
        message = e.message;
      }

      expect(message).toEqual('Error response from OSWeb 404: not found');
    });
  });

  describe('getBookSlugFromId', () => {
    beforeEach(() => {
      (global as any).fetch = mockFetch(200, {
        items: [{cnx_id: 'qwer', meta: {slug: 'asdf'}}],
        meta: {item_count: 1},
      });
    });

    it('gets book slug', async() => {
      const slug = await osWebLoader.getBookSlugFromId('qwer');
      expect(fetch).toHaveBeenCalledWith(`url/v2/pages?type=books.Book&fields=${fields}&cnx_id=qwer`);
      expect(slug).toEqual('asdf');
    });
  });

  describe('getBookFromSlug', () => {
    const book = {cnx_id: 'qwer', meta: {slug: 'asdf'}};
    beforeEach(() => {
      (global as any).fetch = mockFetch(200, {
        items: [book],
        meta: {item_count: 1},
      });
    });

    it('gets book', async() => {
      const result = await osWebLoader.getBookFromSlug('asdf');
      expect(fetch).toHaveBeenCalledWith(`url/v2/pages?type=books.Book&fields=${fields}&slug=asdf`);
      expect(result).toEqual(book);
    });
  });

  describe('getBookFromId', () => {
    const book = {cnx_id: 'qwer', meta: {slug: 'asdf'}};
    beforeEach(() => {
      (global as any).fetch = mockFetch(200, {
        items: [book],
        meta: {item_count: 1},
      });
    });

    it('gets book', async() => {
      const result = await osWebLoader.getBookFromId('qwer');
      expect(fetch).toHaveBeenCalledWith(`url/v2/pages?type=books.Book&fields=${fields}&cnx_id=qwer`);
      expect(result).toEqual(book);
    });

    it('memoizes', async() => {
      book.cnx_id = 'cnx_id1';
      book.meta = {slug: 'slug1'};
      await osWebLoader.getBookFromId('cnx_id1');
      await osWebLoader.getBookFromId('cnx_id1');
      await osWebLoader.getBookFromId('cnx_id1');
      book.cnx_id = 'cnx_id2';
      book.meta = {slug: 'slug2'};
      await osWebLoader.getBookFromId('cnx_id2');
      await osWebLoader.getBookFromId('cnx_id2');
      await osWebLoader.getBookFromId('cnx_id2');
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getSchoolDataFromPortalName', () => {
    const schoolData = {
      id: 123,
      salesforce_id: 'sfid',
      name: 'Test School',
      industry: 'K12',
    };

    beforeEach(() => {
      (global as any).fetch = mockFetch(200, {
        school_data: schoolData,
      });
    });

    it('gets school data from portal name', async () => {
      const result = await osWebLoader.getSchoolDataFromPortalName('portal-abc');
      expect(fetch).toHaveBeenCalledWith('url/v2/pages/portal-abc');
      expect(result).toEqual(schoolData);
    });

    it('returns undefined if no school_data', async () => {
      (global as any).fetch = mockFetch(200, {});
      const result = await osWebLoader.getSchoolDataFromPortalName('portal-xyz');
      expect(result).toBeUndefined();
    });

    it('throws on error', async () => {
      (global as any).fetch = mockFetch(404, 'not found');
      let message: string | undefined;
      try {
        await osWebLoader.getSchoolDataFromPortalName('portal-err');
      } catch (e: any) {
        message = e.message;
      }
      expect(message).toEqual('Error response from OSWeb 404: not found');
    });
  });
});

export default undefined;
