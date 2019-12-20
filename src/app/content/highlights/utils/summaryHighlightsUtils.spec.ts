import {
  Highlight,
  HighlightColorEnum,
  HighlightUpdate,
  HighlightUpdateColorEnum,
} from '@openstax/highlighter/dist/api';
import {
 addSummaryHighlight,
 removeSummaryHighlight,
 updateSummaryHighlight,
 updateSummaryHighlightsDependOnFilters,
} from './summaryHighlightsUtils';

const highlight = { id: 'highlight', color: HighlightColorEnum.Green, annotation: 'asd' } as Highlight;
const highlight2 = { id: 'highlight2' } as Highlight;

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
