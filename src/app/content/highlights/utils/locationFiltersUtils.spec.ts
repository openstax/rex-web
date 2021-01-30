import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { book, page, pageInChapter } from '../../../../test/mocks/archiveLoader';
import { archiveTreeSectionIsChapter, archiveTreeSectionIsPage } from '../../utils/archiveTreeUtils';
import { getHighlightLocationFilterForPage, getHighlightLocationFilters } from './';
import { getHighlightColorFiltersWithContent, sectionIsHighlightLocationFitler } from './locationFiltersUtils';

describe('getHighlightLocationFilters', () => {
  it('should return empty map for book without sections', () => {
    const locationFilters = getHighlightLocationFilters(sectionIsHighlightLocationFitler)({
      ...book,
      tree: {
        ...book.tree,
        contents: [],
      },
    });

    expect(locationFilters.size).toEqual(0);
  });

  it('should return a filtered map of location filters', () => {
    const locationFilters = getHighlightLocationFilters((section) =>
      archiveTreeSectionIsChapter(section) || archiveTreeSectionIsPage(section)
    )(book);

    const onlyPagesAndChapters = Array.from(locationFilters.values())
      .every((location) => archiveTreeSectionIsChapter(location.section) || archiveTreeSectionIsPage(location.section));
    expect(onlyPagesAndChapters).toEqual(true);
  });
});

describe('getHighlightLocationFilterForPage', () => {
  it('should not return anything for page which is not in book', () => {
    const locationFilters = getHighlightLocationFilters(sectionIsHighlightLocationFitler)(book);
    const location = getHighlightLocationFilterForPage(locationFilters, {...pageInChapter, id: 'not-in-book' });
    expect(location).toBeUndefined();
  });

  it('should return chapter for page in chapter', () => {
    const locationFilters = getHighlightLocationFilters(sectionIsHighlightLocationFitler)(book);
    const location = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    expect(location!.id).toEqual('testbook1-testchapter5-uuid');
  });

  it('should return page for page directly in book tree (Preface)', () => {
    const locationFilters = getHighlightLocationFilters(sectionIsHighlightLocationFitler)(book);
    const location = getHighlightLocationFilterForPage(locationFilters, page);
    expect(location!.id).toEqual(page.id);
  });
});

describe('getHighlightColorFiltersWithContent', () => {
  it('should return only color filters which have highlights', () => {
    const totalCounts = {
      location: {
        [HighlightColorEnum.Blue]: 1,
        [HighlightColorEnum.Green]: 1,
      },
      location2: {
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    };

    const expectedResult = new Set([
      HighlightColorEnum.Blue,
      HighlightColorEnum.Green,
      HighlightColorEnum.Pink,
      HighlightColorEnum.Yellow,
    ]);

    expect(getHighlightColorFiltersWithContent(totalCounts)).toEqual(expectedResult);
  });

  it('returns all colors', () => {
    const totalCounts = {
      location: {
        [HighlightColorEnum.Blue]: 1,
        [HighlightColorEnum.Green]: 1,
      },
      location2: {
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Yellow]: 1,
        [HighlightColorEnum.Purple]: 1,
      },
      location3: {
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    };

    const expectedResult = new Set([
      HighlightColorEnum.Blue,
      HighlightColorEnum.Green,
      HighlightColorEnum.Purple,
      HighlightColorEnum.Pink,
      HighlightColorEnum.Yellow,
    ]);

    expect(getHighlightColorFiltersWithContent(totalCounts)).toEqual(expectedResult);
  });

  it('should return empty set if no matching colors were found', () => {
    expect(getHighlightColorFiltersWithContent({})).toEqual(new Set());
  });
});

describe('getHighlightColorFiltersWithContent', () => {
  it('should return only color filters which have highlights', () => {
    const totalCounts = {
      location: {
        [HighlightColorEnum.Blue]: 1,
        [HighlightColorEnum.Green]: 1,
      },
      location2: {
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    };

    const expectedResult = new Set([
      HighlightColorEnum.Blue,
      HighlightColorEnum.Green,
      HighlightColorEnum.Pink,
      HighlightColorEnum.Yellow,
    ]);

    expect(getHighlightColorFiltersWithContent(totalCounts)).toEqual(expectedResult);
  });

  it('returns all colors', () => {
    const totalCounts = {
      location: {
        [HighlightColorEnum.Blue]: 1,
        [HighlightColorEnum.Green]: 1,
      },
      location2: {
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Yellow]: 1,
        [HighlightColorEnum.Purple]: 1,
      },
      location3: {
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    };

    const expectedResult = new Set([
      HighlightColorEnum.Blue,
      HighlightColorEnum.Green,
      HighlightColorEnum.Purple,
      HighlightColorEnum.Pink,
      HighlightColorEnum.Yellow,
    ]);

    expect(getHighlightColorFiltersWithContent(totalCounts)).toEqual(expectedResult);
  });

  it('should return empty set if no matching colors were found', () => {
    expect(getHighlightColorFiltersWithContent({})).toEqual(new Set());
  });
});
