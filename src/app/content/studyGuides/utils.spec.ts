import { HighlightColorEnum } from '@openstax/highlights-client';
import createTestStore from '../../../test/createTestStore';
import { getFiltersFromQuery, updateQueryFromFilterChange } from './utils';

describe('utils', () => {

  describe('getFiltersFromQuery', () => {
    it('get multiple colors and locationIds from the query', () => {
      const output = getFiltersFromQuery({ colors: ['green', 'yellow', 'akljwef'], locationIds: ['1', '2'] });
      expect(output).toEqual(
        { colors: [HighlightColorEnum.Green, HighlightColorEnum.Yellow], locationIds: ['1', '2'] }
      );
    });

    it('get single color and locationId from the query', () => {
      const output = getFiltersFromQuery({ colors: ['green'], locationIds: ['1'] });
      expect(output).toEqual({ colors: [HighlightColorEnum.Green], locationIds: ['1'] });
    });
  });

  describe('updateQueryFromFilterChange', () => {
    let store: Store;
    let dispatch: jest.SpyInstance;

    beforeEach(() => {
      store = createTestStore();
      dispatch = jest.spyOn(store, 'dispatch');
    });

    it('noops if match wansn\'t in the navigation state', () => {
      const state = store.getState();
      updateQueryFromFilterChange(store.dispatch, state, { colors: {new: [], remove: [HighlightColorEnum.Green]} });

      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});
