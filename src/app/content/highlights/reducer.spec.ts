import { HighlightColorEnum, HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import { page } from '../../../test/mocks/archiveLoader';
import { receiveLoggedOut } from '../../auth/actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import { assertNotNull } from '../../utils';
import { receivePage } from '../actions';
import * as actions from './actions';
import reducer, { initialState } from './reducer';
import {
  CountsPerSource,
  HighlightData,
  SummaryHighlights,
} from './types';

const mockHighlight = {
  color: HighlightColorEnum.Blue,
  id: 'asdf',
} as HighlightData;

describe('highlight reducer', () => {
  it('sets initial state', () => {
    const newState = reducer(undefined, {type: 'asdf'} as unknown as AnyAction);
    expect(newState).toEqual(initialState);
  });

  it('receivePage - keeps pageId and highlights if called with current pageUid', () => {
    const state = reducer(
      {...initialState, currentPage: {...initialState.currentPage, highlights: [mockHighlight], pageId: page.id}},
      receivePage({...page, references: []}));
    expect(state.currentPage.pageId).toEqual(page.id);
    expect(state.currentPage.highlights).toEqual([mockHighlight]);
  });

  it('receivePage - reset pageId and highlights if called with different pageUid', () => {
    const state = reducer(
      {...initialState, currentPage: {...initialState.currentPage, highlights: [mockHighlight], pageId: '123'}},
      receivePage({...page, references: []}));
    expect(state.currentPage.pageId).toEqual(null);
    expect(state.currentPage.highlights).toEqual(initialState.currentPage.highlights);
  });

  it('receivePage - reset hasUnsavedHighlight and focused', () => {
    const state = reducer(
      {
        ...initialState,
        currentPage: {...initialState.currentPage, pageId: 'asdf', hasUnsavedHighlight: true, focused: 'asd'},
      },
      receivePage({...page, references: []}));
    expect(state.currentPage.hasUnsavedHighlight).toEqual(false);
    expect(state.currentPage.focused).toBeUndefined();
  });

  it('locationChange - noops for REPLACE action', () => {
    const mockState = {
      ...initialState,
      currentPage: {...initialState.currentPage, highlights: [mockHighlight], pageId: '123'},
    };
    const state = reducer(
      mockState,
      locationChange({action: 'REPLACE', location: {state: {pageUid: 'asdf'}, search: ''}} as any));
    expect(state).toEqual(mockState);
  });

  it('locationChange - keeps summary open if query parameter is present' , () => {
    const mockState = {
      currentPage: {...initialState.currentPage, highlights: [mockHighlight], pageId: '123'},
      summary: {...initialState.summary, open: true},
    };

    const state = reducer(
      mockState,
      locationChange({action: 'PUSH', location: {state: {pageUid: 'asdf'}, search: '?modal=MH'}} as any));
    expect(state.summary.open).toBe(true);
  });

  it('focuses highlight', () => {
    const state = reducer(undefined, actions.focusHighlight('asdf'));
    expect(state.currentPage.focused).toEqual('asdf');
  });

  it('clears focused highlight', () => {
    const state = reducer(
      {...initialState, currentPage: {...initialState.currentPage, focused: 'asdf'}},
      actions.clearFocusedHighlight());
    expect(state.currentPage.focused).toEqual(undefined);
  });

  it('removing the focused highlight also clears focus', () => {
    const state = reducer({
      ...initialState,
      currentPage: {...initialState.currentPage, highlights: [mockHighlight], focused: 'asdf'},
    }, actions.receiveDeleteHighlight(mockHighlight, {
      locationFilterId: 'highlightChapter',
      pageId: 'highlightSource',
    }));
    expect(state.currentPage.focused).toEqual(undefined);
  });

  it('receive total counts', () => {
    const totalCountsPerPage: CountsPerSource = {
      page1: {[HighlightColorEnum.Green]: 1},
      page2: {[HighlightColorEnum.Pink]: 3},
    };

    const state = reducer({
      ...initialState,
    }, actions.receiveHighlightsTotalCounts(totalCountsPerPage, new Map()));

    expect(state.summary.totalCountsPerPage).toMatchObject(totalCountsPerPage);
  });

  it('request more summary highlights', () => {
    const state = reducer({
      ...initialState,
    }, actions.loadMoreSummaryHighlights());

    expect(state.summary.loading).toBe(true);
  });

  it('init sets loading state', () => {
    const state = reducer({
      ...initialState,
    }, actions.initializeMyHighlightsSummary());

    expect(state.summary.loading).toBe(true);
  });

  it('creates highlights', () => {
    const state = reducer({
      ...initialState,
      summary: {
        ...initialState.summary,
        filters: {
          ...initialState.summary.filters,
          locationIds: ['highlightChapter'],
        },
        highlights: {},
        totalCountsPerPage: {},
      },
    }, actions.createHighlight({...mockHighlight, sourceId: 'highlightSource'} as any, {
      locationFilterId: 'highlightChapter',
      pageId: 'highlightSource',
    }));

    if (!(state.currentPage.highlights instanceof Array)) {
      return expect(state.currentPage.highlights).toBe(expect.any(Array));
    }
    expect(state.currentPage.highlights.length).toEqual(1);
    expect(state.currentPage.highlights[0].id).toEqual('asdf');
    expect(state.summary.totalCountsPerPage).toEqual({ highlightSource: {blue: 1} });
    const highlights = assertNotNull(state.summary.highlights, '').highlightChapter.highlightSource;
    expect(highlights.length).toEqual(1);
    expect(highlights.find((h) => h.id === mockHighlight.id)).toBeTruthy();
  });

  describe('deleteHighlight', () => {

    it('noops when highlight doesn\'t exist', () => {
      const state = reducer({
        ...initialState,
      }, actions.receiveDeleteHighlight({id: 'asdf'} as HighlightData, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
      }));

      expect(state.currentPage.highlights).toBe(null);
      expect(state.summary.highlights).toBe(initialState.summary.highlights);
    });

    it('deletes from summary even if there are no highlights on the current page', () => {
      const state = reducer({
        ...initialState,
        summary: {
          ...initialState.summary,
          highlights: {
            highlightChapter: {
              highlightSource: [{...mockHighlight, sourceId: 'highlightSource'}],
              otherHighlightSource: [mockHighlight],
            },
          },
          totalCountsPerPage: {
            highlightSource: {[HighlightColorEnum.Green]: 1},
          },
        },
      }, actions.receiveDeleteHighlight(mockHighlight, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
      }));

      const summaryHighlights = state.summary.highlights;
      if (!summaryHighlights) {
        return expect(summaryHighlights).toBeTruthy();
      }

      expect(summaryHighlights.highlightChapter.highlightSource).toBeUndefined();
      expect(state.currentPage.highlights).toBe(null);
    });

    it('deletes', () => {
      const state = reducer({
        currentPage: {...initialState.currentPage, highlights: [mockHighlight]},
        summary: {
          ...initialState.summary,
          highlights: {
            highlightChapter: {
              highlightSource: [{...mockHighlight, sourceId: 'highlightSource'}],
              otherHighlightSource: [mockHighlight],
            },
          },
          totalCountsPerPage: {
            highlightSource: {[HighlightColorEnum.Green]: 1},
          },
        },
      }, actions.receiveDeleteHighlight({id: 'asdf'} as HighlightData, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
      }));

      if (!(state.currentPage.highlights instanceof Array)) {
        return expect(state.currentPage.highlights).toBe(expect.any(Array));
      }

      expect(state.currentPage.highlights.length).toEqual(0);
      expect(state.summary.totalCountsPerPage).toEqual({ highlightSource: {green: 1} });
      const chapterHighlights = assertNotNull(state.summary.highlights, '').highlightChapter;
      expect(Object.keys(chapterHighlights).length).toEqual(1);
      expect(chapterHighlights.highlightSource).toBeUndefined();
    });
  });

  describe('updateHighlight', () => {

    it('noops when highlight doesn\'t exist', () => {
      const state = reducer({
        ...initialState,
      }, actions.updateHighlight({id: 'asdf', highlight: {annotation: 'asdf'}}, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
        preUpdateData: {id: 'asdf', highlight: {}},
      }));

      expect(state.currentPage.highlights).toBe(null);
      expect(state.summary.highlights).toBe(initialState.summary.highlights);
    });

    it('updates the highlight in summary even if there are no highlights on the current page', () => {
      const toUpdate = {...mockHighlight, sourceId: 'highlightSource', id: 'xyz'};

      const state = reducer({
        ...initialState,
        summary: {
          ...initialState.summary,
          filters: {
            ...initialState.summary.filters,
            locationIds: ['highlightChapter'],
          },
          highlights: {
            highlightChapter: {
              highlightSource: [toUpdate, mockHighlight],
            },
          },
        },
      }, actions.updateHighlight({id: toUpdate.id, highlight: {annotation: 'asdf'}}, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
        preUpdateData: {
          highlight: {
            annotation: mockHighlight.annotation,
            color: mockHighlight.color as string as HighlightUpdateColorEnum,
          },
          id: 'yxz',
        },
      }));

      const summaryHighlights = state.summary.highlights;
      if (!summaryHighlights) {
        return expect(summaryHighlights).toBeTruthy();
      }

      expect(summaryHighlights.highlightChapter.highlightSource[0].annotation).toEqual('asdf');
      expect(summaryHighlights.highlightChapter.highlightSource[1]).toEqual(mockHighlight);
      expect(state.currentPage.highlights).toBe(null);
    });

    it('updates', () => {
      const mock1 = mockHighlight;
      const mock3 = {...mockHighlight, id: 'qwer'};

      const state = reducer({
        currentPage: {...initialState.currentPage, highlights: [mock1, mock3]},
        summary: {
          ...initialState.summary,
          filters: {
            ...initialState.summary.filters,
            locationIds: ['highlightChapter'],
          },
          highlights: {
            highlightChapter: {
              highlightSource: [mock1, mock3],
            },
          },
        },
      }, actions.updateHighlight({id: mock1.id, highlight: {annotation: 'asdf'}}, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
        preUpdateData: {id: mock1.id, highlight: {annotation: mock1.annotation, color: mock1.annotation as any}},
      }));

      if (!(state.currentPage.highlights instanceof Array)) {
        return expect(state.currentPage.highlights).toBe(expect.any(Array));
      }

      expect(state.currentPage.highlights[0].annotation).toEqual('asdf');
      expect(state.currentPage.highlights[1]).toEqual(mock3);
      const highlights = assertNotNull(state.summary.highlights, '').highlightChapter.highlightSource;
      expect(highlights[0].annotation).toEqual('asdf');
      expect(highlights[1]).toEqual(mock3);
    });

    it('does not affect hasUnsavedHighlight if only color has changed', () => {
      const mock1 = {...mockHighlight, sourceId: 'highlightSource'};
      const mock3 = {...mockHighlight, id: 'qwer', sourceId: 'highlightSource'};

      const state = reducer({
        ...initialState,
        currentPage: {
          ...initialState.currentPage,
          hasUnsavedHighlight: true,
          highlights: [mock1, mock3],
        },
      }, actions.updateHighlight({id: mock1.id, highlight: {color: HighlightUpdateColorEnum.Green}}, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
        preUpdateData: {id: mock1.id, highlight: {annotation: mock1.annotation, color: mock1.color as any}},
      }));

      expect(state.currentPage.hasUnsavedHighlight).toBe(true);
    });

    it('does not modify summary highlights if they haven\'t been loaded', () => {
      const mock1 = {...mockHighlight, sourceId: 'highlightSource'};
      const mock3 = {...mockHighlight, id: 'qwer', sourceId: 'highlightSource'};

      const state = reducer({
        currentPage: {...initialState.currentPage, highlights: [mock1, mock3]},
        summary: {
          ...initialState.summary,
          filters: {
            colors: [HighlightColorEnum.Blue],
            locationIds: ['highlightChapter'],
          },
          totalCountsPerPage: {
            highlightSource: {[HighlightColorEnum.Blue]: 2},
          },
        },
      }, actions.updateHighlight({id: mock1.id, highlight: {color: HighlightUpdateColorEnum.Green}}, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
        preUpdateData: {id: mock1.id, highlight: {annotation: mock1.annotation, color: mock1.color as any}},
      }));

      expect(state.summary.highlights).toBe(null);
    });

    it('remove highlight from summary highlights if color filters does not match', () => {
      const mock1 = {...mockHighlight, sourceId: 'highlightSource'};
      const mock3 = {...mockHighlight, id: 'qwer', sourceId: 'highlightSource'};

      const state = reducer({
        currentPage: {...initialState.currentPage, highlights: [mock1, mock3]},
        summary: {
          ...initialState.summary,
          filters: {
            colors: [HighlightColorEnum.Blue],
            locationIds: ['highlightChapter'],
          },
          highlights: {
            highlightChapter: {
              highlightSource: [mock1, mock3],
            },
          },
          totalCountsPerPage: {
            highlightSource: {[HighlightColorEnum.Blue]: 2},
          },
        },
      }, actions.updateHighlight({id: mock1.id, highlight: {color: HighlightUpdateColorEnum.Green}}, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
        preUpdateData: {id: mock1.id, highlight: {annotation: mock1.annotation, color: mock1.color as any}},
      }));

      if (!(state.currentPage.highlights instanceof Array)) {
        return expect(state.currentPage.highlights).toBe(expect.any(Array));
      }

      expect(state.currentPage.highlights[0].color).toEqual(HighlightColorEnum.Green);
      expect(state.currentPage.highlights[1]).toEqual(mock3);
      const highlights = assertNotNull(state.summary.highlights, '').highlightChapter.highlightSource;
      expect(highlights.length).toEqual(1);
      expect(highlights[0]).toEqual(mock3);
      expect(state.summary.totalCountsPerPage!.highlightSource.blue).toEqual(1);
      expect(state.summary.totalCountsPerPage!.highlightSource.green).toEqual(1);
    });

    it('add highlight to summary highlights if new color match current filters', () => {
      const mock1 = mockHighlight;
      const mock3 = {...mockHighlight, id: 'qwer'};

      const state = reducer({
        currentPage: {...initialState.currentPage, highlights: [mock1, mock3]},
        summary: {
          ...initialState.summary,
          filters: {
            colors: [HighlightColorEnum.Blue],
            locationIds: ['highlightChapter'],
          },
          highlights: {
            highlightChapter: {
              highlightSource: [],
            },
          },
        },
      }, actions.updateHighlight({id: mock1.id, highlight: {color: HighlightUpdateColorEnum.Blue}}, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
        preUpdateData: {id: mock1.id, highlight: {annotation: mock1.annotation, color: mock1.color as any}},
      }));

      if (!(state.currentPage.highlights instanceof Array)) {
        return expect(state.currentPage.highlights).toBe(expect.any(Array));
      }

      expect(state.currentPage.highlights[0].color).toEqual(HighlightColorEnum.Blue);
      expect(state.currentPage.highlights[1]).toEqual(mock3);
      const highlights = assertNotNull(state.summary.highlights, '').highlightChapter.highlightSource;
      expect(highlights.length).toEqual(1);
      expect(highlights[0].color).toEqual(HighlightUpdateColorEnum.Blue);
    });

    it('return state if new highlight was not found in it', () => {
      const mock1 = mockHighlight;
      const mock3 = {...mockHighlight, id: 'qwer'};

      const state = reducer({
        ...initialState,
        currentPage: {...initialState.currentPage, highlights: [mock1, mock3]},
      }, actions.updateHighlight({id: 'id-not-exists', highlight: {color: HighlightUpdateColorEnum.Blue}}, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
        preUpdateData: {id: 'id-not-exists', highlight: {}},
      }));

      expect(state).toMatchObject(state);
    });
  });

  describe('update summary', () => {
    it('set summary filters', () => {
      const state = reducer({
        ...initialState,
        summary: {
          ...initialState.summary,
          filters: {
            colors: [],
            locationIds: [],
          },
        },
      }, actions.setSummaryFilters({
        colors: [HighlightColorEnum.Green],
        locationIds: ['id'],
      }));

      expect(state.summary.filters.locationIds[0]).toEqual('id');
      expect(state.summary.filters.locationIds.length).toEqual(1);
      expect(state.summary.filters.colors[0]).toEqual(HighlightColorEnum.Green);
      expect(state.summary.filters.colors.length).toEqual(1);
      expect(state.summary.loading).toEqual(true);
    });

    it('receive summary highlights', () => {
      const highlights: SummaryHighlights = {
        chapter_id: {
          page_id: [
            {id: 'highlight'} as HighlightData,
          ],
        },
      };

      const state = reducer({
        ...initialState,
        summary: {
          ...initialState.summary,
          filters: {
            colors: [HighlightColorEnum.Green],
            locationIds: ['id'],
          },
          loading: true,
        },
      }, actions.receiveSummaryHighlights(highlights, {pagination: null}));

      expect(state.summary.highlights).toMatchObject(highlights);
      expect(state.summary.loading).toEqual(false);
    });

    it('noops for receive summary highlights with stale filters', () => {
      const highlights: SummaryHighlights = {
        chapter_id: {
          page_id: [
            {id: 'highlight'} as HighlightData,
          ],
        },
      };

      const mockState = {
        ...initialState,
        summary: {
          ...initialState.summary,
          filters: {
            colors: [HighlightColorEnum.Green],
            locationIds: ['id'],
          },
          loading: true,
        },
      };

      const staleFilters = {
        colors: [],
        locationIds: [],
      };

      const state = reducer(
        mockState,
        actions.receiveSummaryHighlights(highlights, {pagination: null, filters: staleFilters }));

      expect(state).toEqual(mockState);
    });
  });

  it('clear state when receive logged out', () => {
    const state = reducer({
      ...initialState,
      summary: {
        ...initialState.summary,
        filters: {
          colors: [HighlightColorEnum.Green],
          locationIds: ['id'],
        },
        loading: true,
      },
    }, receiveLoggedOut());

    expect(state).toEqual(initialState);
  });

  it('sets readyToPrintHighlights in summary when receiveReadyToPrintHighlights is dispatched', () => {
    const prevState = {
      ...initialState,
      summary: {
        ...initialState.summary,
        readyToPrintHighlights: false,
      },
    };
    const action = actions.receiveReadyToPrintHighlights(true);
    const state = reducer(prevState, action);
    expect(state.summary.readyToPrintHighlights).toBe(true);

    const action2 = actions.receiveReadyToPrintHighlights(false);
    const state2 = reducer(prevState, action2);
    expect(state2.summary.readyToPrintHighlights).toBe(false);
  });
});
