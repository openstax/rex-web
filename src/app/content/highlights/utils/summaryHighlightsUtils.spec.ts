import {
  HighlightColorEnum,
  HighlightUpdate,
  HighlightUpdateColorEnum,
} from '@openstax/highlighter/dist/api';
import { treeWithoutUnits } from '../../../../test/trees';
import { CountsPerSource, HighlightData } from '../types';
import {
  addSummaryHighlight,
  addToTotalCounts,
  getHighlightByIdFromSummaryHighlights,
  getSortedSummaryHighlights,
  insertHighlightInOrder,
  removeFromTotalCounts,
  removeSummaryHighlight,
  updateInTotalCounts,
  updateSummaryHighlight,
  updateSummaryHighlightsDependOnFilters,
} from './summaryHighlightsUtils';

const highlight = {
  annotation: 'asd',
  color: HighlightColorEnum.Green,
  id: 'highlight',
  sourceId: 'page1',
} as HighlightData;
const highlight2 = { id: 'highlight2' } as HighlightData;

describe('addSummaryHighlight', () => {
  it('add highlight to empty object', () => {
    const expectedResult = {
      location: {
        page: [highlight],
      },
    };

    expect(addSummaryHighlight({}, {
      highlight,
      locationFilterId: 'location',
      pageId: 'page',
    })).toMatchObject(expectedResult);
  });

  it('add highlight to existing page', () => {
    const summaryHighlights = {
      location: {
        page: [highlight],
      },
    };

    const expectedResult = {
      location: {
        page: [highlight, highlight2],
      },
    };

    expect(addSummaryHighlight(summaryHighlights, {
      highlight: highlight2,
      locationFilterId: 'location',
      pageId: 'page',
    })).toMatchObject(expectedResult);
  });

  it('add highlight to existing location but without exisitng page', () => {
    const summaryHighlights = {
      location: {
        page: [highlight],
      },
    };

    const expectedResult = {
      location: {
        page: [highlight],
        page2: [highlight2],
      },
    };

    expect(addSummaryHighlight(summaryHighlights, {
      highlight: highlight2,
      locationFilterId: 'location',
      pageId: 'page2',
    })).toMatchObject(expectedResult);
  });
});

describe('getSortedSummaryHighlights', () => {
  it('returns highlights sorted according to page order', () => {
    const unsortedPageIds = ['page2', 'page1'];
    const mockHighlights = [highlight, highlight2];
    const mockChapterTree = {
      ...treeWithoutUnits,
      parent: 'parent' as any,
      title: '<span class="os-number">1</span><span class="os-divider"> </span><span class="os-text">chapter 1</span>',
    };
    const locationId = 'location';
    const summaryHighlights = {
      [locationId]: unsortedPageIds.reduce((p, c) => ({...p, [c]: mockHighlights }), {}),
    };

    const expectedResult = [
      {
        location: mockChapterTree,
        pages: [
          {
            highlights: mockHighlights,
            pageId: 'page1',
          },
          {
            highlights: mockHighlights,
            pageId: 'page2',
          },
        ],
      },
    ];

    const locationFilters =  new Map([[locationId, { section: mockChapterTree }]]);
    const sortedHighlights = getSortedSummaryHighlights(summaryHighlights, locationFilters);

    expect(sortedHighlights).toEqual(expectedResult);
  });
});

describe('insertHighlightInOrder', () => {
  it('inserts highlights in proper order', () => {
    let highlights: HighlightData[] = [];
    const mockHighlghts = [
      {
        id: 'hl1',
        nextHighlightId: undefined,
        prevHighlightId: undefined,
      } ,
      {
        id: 'hl2',
        nextHighlightId: undefined,
        prevHighlightId: 'hl1',
      },
      {
        id: 'hl3',
        nextHighlightId: 'hl2',
        prevHighlightId: 'hl1',
      } ,
      {
        id: 'hl4',
        nextHighlightId: 'hl1',
        prevHighlightId: undefined,
      },
      {
        id: 'hl5',
        nextHighlightId: undefined,
        prevHighlightId: 'hl2',
      },
    ] as HighlightData[];

    mockHighlghts.forEach((mockHighlight) => {
      highlights = insertHighlightInOrder(highlights, mockHighlight);
    });
    expect(highlights.map((hl) => hl.id)).toEqual(['hl4', 'hl1', 'hl3', 'hl2', 'hl5']);
  });
});

describe('removeSummaryHighlight', () => {
  it('remove highlight', () => {
    const summaryHighlights = {
      location: {
        page: [highlight, highlight2],
      },
    };

    const expectedResult = {
      location: {
        page: [highlight2],
      },
    };

    expect(removeSummaryHighlight(summaryHighlights, {
      id: highlight.id,
      locationFilterId: 'location',
      pageId: 'page',
    })).toMatchObject(expectedResult);
  });

  it('remove highlight and page if it does not have more highlights', () => {
    const summaryHighlights = {
      location: {
        page: [highlight],
        page2: [highlight2],
      },
    };

    const expectedResult = {
      location: {
        page2: [highlight2],
      },
    };

    expect(removeSummaryHighlight(summaryHighlights, {
      id: highlight.id,
      locationFilterId: 'location',
      pageId: 'page',
    })).toMatchObject(expectedResult);
  });

  it('remove highlight, page and location if it does not have more highlights', () => {
    const summaryHighlights = {
      location: {
        page: [highlight],
      },
    };

    const expectedResult = {};

    expect(removeSummaryHighlight(summaryHighlights, {
      id: highlight.id,
      locationFilterId: 'location',
      pageId: 'page',
    })).toMatchObject(expectedResult);
  });

  it('noops if highlight was not in object', () => {
    expect(removeSummaryHighlight({}, {
      id: 'highlight',
      locationFilterId: 'location',
      pageId: 'page',
    })).toMatchObject({});
  });
});

describe('updateSummaryHighlight', () => {
  it('update color', () => {
    const summaryHighlights = {
      location: {
        page: [highlight],
      },
    };

    const dataToUpdate = {
      color: HighlightUpdateColorEnum.Pink,
    } as HighlightUpdate;

    const expectedResult = {
      location: {
        page: [{...highlight, ...dataToUpdate}],
      },
    };

    expect(updateSummaryHighlight(summaryHighlights, {
      highlight: dataToUpdate,
      id: highlight.id,
      locationFilterId: 'location',
      pageId: 'page',
    })).toMatchObject(expectedResult);
  });

  it('update color and annotation', () => {
    const summaryHighlights = {
      location: {
        page: [highlight],
      },
    };

    const dataToUpdate = {
      annotation: 'asdf',
      color: HighlightUpdateColorEnum.Pink,
    } as HighlightUpdate;

    const expectedResult = {
      location: {
        page: [{...highlight, ...dataToUpdate}],
      },
    };

    expect(updateSummaryHighlight(summaryHighlights, {
      highlight: dataToUpdate,
      id: highlight.id,
      locationFilterId: 'location',
      pageId: 'page',
    })).toMatchObject(expectedResult);
  });

  it('noops if highlight was not in object', () => {
    expect(updateSummaryHighlight({}, {
      highlight: {id: 'id'} as unknown as HighlightUpdate,
      id: 'highlight',
      locationFilterId: 'location',
      pageId: 'page',
    })).toMatchObject({});
  });
});

describe('updateSummaryHighlightsDependOnFilters', () => {
  it('noops if locationFilterId is not in filters', () => {
    const summaryHighlights = {
      location: {
        page: [highlight],
      },
    };

    const filters = {
      colors: [HighlightColorEnum.Yellow],
      locationIds: ['location'],
    };

    const newHighlight = {...highlight, color: HighlightColorEnum.Blue};

    expect(updateSummaryHighlightsDependOnFilters(summaryHighlights, filters, {
      highlight: newHighlight,
      locationFilterId: 'not-in-filters',
      pageId: 'page',
    })).toMatchObject(summaryHighlights);
  });

  it('noops if color is not in filters', () => {
    const summaryHighlights = {
      location: {
        page: [highlight],
      },
    };

    const filters = {
      colors: [HighlightColorEnum.Yellow],
      locationIds: ['location'],
    };

    const newHighlight = {...highlight, color: HighlightColorEnum.Blue};

    expect(updateSummaryHighlightsDependOnFilters(summaryHighlights, filters, {
      highlight: newHighlight,
      locationFilterId: 'location',
      pageId: 'page2',
    })).toMatchObject(summaryHighlights);
  });

  it('remove highlight if it does not match current color filters', () => {
    const summaryHighlights = {
      location: {
        page: [highlight],
      },
    };

    const filters = {
      colors: [HighlightColorEnum.Yellow],
      locationIds: ['location'],
    };

    const newHighlight = {...highlight, color: HighlightColorEnum.Blue};

    expect(updateSummaryHighlightsDependOnFilters(summaryHighlights, filters, {
      highlight: newHighlight,
      locationFilterId: 'location',
      pageId: 'page',
    })).toMatchObject({});
  });

  it('update highlight if it match current color filters', () => {
    const summaryHighlights = {
      location: {
        page: [highlight],
      },
    };

    const filters = {
      colors: [HighlightColorEnum.Yellow],
      locationIds: ['location'],
    };

    const newHighlight = {...highlight, color: HighlightColorEnum.Yellow};

    const expectedResult = {
      location: {
        page: [newHighlight],
      },
    };

    expect(updateSummaryHighlightsDependOnFilters(summaryHighlights, filters, {
      highlight: newHighlight,
      locationFilterId: 'location',
      pageId: 'page',
    })).toMatchObject(expectedResult);
  });

  it('update highlight if only annotation has changed', () => {
    const summaryHighlights = {
      page: {
        page: [highlight],
      },
    };

    const filters = {
      colors: [highlight.color],
      locationIds: ['page'],
    };

    const newHighlight = {...highlight, annotation: 'asdf123'};

    const expectedResult = {
      page: {
        page: [newHighlight],
      },
    };

    expect(updateSummaryHighlightsDependOnFilters(summaryHighlights, filters, {
      highlight: newHighlight,
      locationFilterId: 'page',
      pageId: 'page',
    })).toMatchObject(expectedResult);
  });

  it('add highlight if it match current color filters and was not in object before', () => {
    const summaryHighlights = {};

    const filters = {
      colors: [HighlightColorEnum.Yellow],
      locationIds: ['location'],
    };

    const newHighlight = {...highlight, color: HighlightColorEnum.Yellow};

    const expectedResult = {
      location: {
        page: [newHighlight],
      },
    };

    expect(updateSummaryHighlightsDependOnFilters(summaryHighlights, filters, {
      highlight: newHighlight,
      locationFilterId: 'location',
      pageId: 'page',
    })).toMatchObject(expectedResult);
  });
});

describe('removeFromTotalCounts', () => {
  it('remove one from total counts from given id', () => {
    const totalCounts: CountsPerSource = {
      page1: {[HighlightColorEnum.Green]: 1},
      page2: {[HighlightColorEnum.Pink]: 3},
    };

    const expectedResult: CountsPerSource = {
      page2: {[HighlightColorEnum.Pink]: 3},
    };

    expect(removeFromTotalCounts(totalCounts, highlight)).toEqual(expectedResult);
  });

  it('do nothing if if given id doesn\'t not exists', () => {
    const totalCounts: CountsPerSource = {
      page1: {[HighlightColorEnum.Green]: 1},
      page2: {[HighlightColorEnum.Pink]: 3},
    };

    const expectedResult: CountsPerSource = {
      page1: {[HighlightColorEnum.Green]: 1},
      page2: {[HighlightColorEnum.Pink]: 3},
    };

    expect(removeFromTotalCounts(totalCounts, {...highlight, sourceId: 'asdf'})).toEqual(expectedResult);
  });
});

describe('addOneToTotalCounts', () => {
  it('add one to total counts for given id', () => {
    const totalCounts: CountsPerSource = {
      page1: {[HighlightColorEnum.Green]: 1},
      page2: {[HighlightColorEnum.Pink]: 3},
    };

    const expectedResult: CountsPerSource = {
      page1: {[HighlightColorEnum.Green]: 2},
      page2: {[HighlightColorEnum.Pink]: 3},
    };

    expect(addToTotalCounts(totalCounts, highlight)).toEqual(expectedResult);
  });

  it('create new prop if there is no result for given id', () => {
    const totalCounts: CountsPerSource = {
      page2: {[HighlightColorEnum.Pink]: 3},
    };

    const expectedResult: CountsPerSource = {
      page1: {[HighlightColorEnum.Green]: 1},
      page2: {[HighlightColorEnum.Pink]: 3},
    };

    expect(addToTotalCounts(totalCounts, highlight)).toEqual(expectedResult);
  });
});

describe('updateInTotalCounts', () => {
  it('updates', () => {
    const totalCounts: CountsPerSource = {
      page1: {[HighlightColorEnum.Green]: 1},
      page2: {[HighlightColorEnum.Pink]: 3},
    };

    const expectedResult: CountsPerSource = {
      page1: {[HighlightColorEnum.Pink]: 1},
      page2: {[HighlightColorEnum.Pink]: 3},
    };

    expect(updateInTotalCounts(totalCounts, highlight, {...highlight, color: HighlightColorEnum.Pink}))
      .toEqual(expectedResult);
  });

  it('noops if there is nothing to change', () => {
    const totalCounts: CountsPerSource = {
      page1: {[HighlightColorEnum.Green]: 1},
      page2: {[HighlightColorEnum.Pink]: 3},
    };

    expect(updateInTotalCounts(totalCounts, highlight, highlight))
      .toBe(totalCounts);
  });

  describe('getHighlightByIdFromSummaryHighlights', () => {
    it('get highlight', () => {
      const summaryHighlights = {
        page: {
          page: [highlight],
        },
        page2: {
          page: [highlight2],
        },
      };

      const foundHighlight = getHighlightByIdFromSummaryHighlights(summaryHighlights, highlight.id);

      expect(foundHighlight).toEqual(highlight);
    });

    it('return undefined if highlight was not found', () => {
      const summaryHighlights = {
        page: {
          page: [highlight],
        },
      };

      const foundHighlight = getHighlightByIdFromSummaryHighlights(summaryHighlights, 'not-here');

      expect(foundHighlight).toBeUndefined();
    });
  });
});
