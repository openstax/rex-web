import { HighlightColorEnum } from '@openstax/highlights-client';
import { getFiltersFromQuery } from './utils';

describe('getFiltersFromQuery', () => {
  it('get multiple colors and locationIds from the query', () => {
    const output = getFiltersFromQuery(
      { colors: ['green', 'yellow', 'akljwef'], locationIds: ['1', '2'] },
      { colors: [], locationIds: [], default: true }
    );
    expect(output).toEqual({ colors: [HighlightColorEnum.Green, HighlightColorEnum.Yellow], locationIds: ['1', '2'] });
  });

  it('get single color and locationId from the query', () => {
    const output = getFiltersFromQuery(
      { colors: ['green'], locationIds: ['1'] },
      { colors: [], locationIds: [], default: true }
    );
    expect(output).toEqual({ colors: [HighlightColorEnum.Green], locationIds: ['1'] });
  });

  it('use values from the state if there is nothing in the query', () => {
    const output = getFiltersFromQuery(
      { colors: [], locationIds: [] },
      { colors: [HighlightColorEnum.Green], locationIds: ['from-state'], default: true }
    );
    expect(output).toEqual({ colors: [HighlightColorEnum.Green], locationIds: ['from-state'] });
  });
});
