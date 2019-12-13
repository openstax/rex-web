import { receiveFeatureFlags } from '../../actions';
import * as actions from './actions';
import { highlightingFeatureFlag } from './constants';
import reducer, { initialState } from './reducer';
import { HighlightData, SummaryHighlights } from './types';
import { HighlightColorEnum } from '@openstax/highlighter/dist/api';

const mockHighlight = {
  id: 'asdf',
} as HighlightData;

describe('highlight reducer', () => {

  it('is initially disabled', () => {
    const newState = reducer(undefined, {type: 'adsf'} as any);
    expect(newState.enabled).toEqual(false);
  });

  it('activates feature flag', () => {
    const state = reducer({
      ...initialState,
      enabled: false,
    }, receiveFeatureFlags([highlightingFeatureFlag]));

    expect(state.enabled).toEqual(true);
  });

  it('doesn\'t active for other flags', () => {
    const state = reducer({
      ...initialState,
      enabled: false,
    }, receiveFeatureFlags(['asdf']));

    expect(state.enabled).toEqual(false);
  });

  it('focuses highlight', () => {
    const state = reducer(undefined, actions.focusHighlight('asdf'));
    expect(state.focused).toEqual('asdf');
  });

  it('clears focused highlight', () => {
    const state = reducer({...initialState, focused: 'asdf'}, actions.clearFocusedHighlight());
    expect(state.focused).toEqual(undefined);
  });

  it('removing the focused highlight also clears focus', () => {
    const state = reducer({
      ...initialState,
      focused: 'asdf',
      highlights: [mockHighlight],
    }, actions.deleteHighlight(mockHighlight.id));
    expect(state.focused).toEqual(undefined);
  });

  it('creates highlights', () => {
    const state = reducer(undefined, actions.createHighlight(mockHighlight as any));

    if (!(state.highlights instanceof Array)) {
      return expect(state.highlights).toBe(expect.any(Array));
    }
    expect(state.highlights.length).toEqual(1);
    expect(state.highlights[0].id).toEqual('asdf');
  });

  describe('deleteHighlight', () => {

    it('noops with no highlights', () => {
      const state = reducer({
        ...initialState,
      }, actions.deleteHighlight('asdf'));

      expect(state.highlights).toBe(null);
    });

    it('deletes', () => {
      const state = reducer({
        ...initialState,
        highlights: [mockHighlight],
      }, actions.deleteHighlight(mockHighlight.id));

      if (!(state.highlights instanceof Array)) {
        return expect(state.highlights).toBe(expect.any(Array));
      }

      expect(state.highlights.length).toEqual(0);
    });
  });

  describe('updateHighlight', () => {

    it('noops if there are no highlgihts', () => {
      const state = reducer({
        ...initialState,
      }, actions.updateHighlight({id: 'asdf', highlight: {annotation: 'asdf'}}));

      expect(state.highlights).toBe(null);
    });

    it('updates', () => {
      const mock1 = mockHighlight;
      const mock3 = {...mockHighlight, id: 'qwer'};

      const state = reducer({
        ...initialState,
        highlights: [mock1, mock3],
      }, actions.updateHighlight({id: mock1.id, highlight: {annotation: 'asdf'}}));

      if (!(state.highlights instanceof Array)) {
        return expect(state.highlights).toBe(expect.any(Array));
      }

      expect(state.highlights[0].annotation).toEqual('asdf');
      expect(state.highlights[1]).toEqual(mock3);
    });
  });

  describe('update summary', () => {
    it('set summary is loading', () => {
      const state = reducer({
        ...initialState,
        summary: {
          ...initialState.summary,
          loading: false,
        },
      }, actions.setIsLoadingSummary(true));

      expect(state.summary.loading).toEqual(true);
    });

    it('set color filters', () => {
      const state = reducer({
        ...initialState,
        summary: {
          ...initialState.summary,
          filters: {
            chapters: [],
            colors: [],
          },
        },
      }, actions.setColorsFilter([HighlightColorEnum.Green]));

      expect(state.summary.filters.colors[0]).toEqual(HighlightColorEnum.Green);
      expect(state.summary.filters.colors.length).toEqual(1);
    });

    it('set chapter filters', () => {
      const state = reducer({
        ...initialState,
        summary: {
          ...initialState.summary,
          filters: {
            chapters: [],
            colors: [],
          },
        },
      }, actions.setChaptersFilter(['id']));

      expect(state.summary.filters.chapters[0]).toEqual('id');
      expect(state.summary.filters.chapters.length).toEqual(1);
    });

    it('do not pass summary highlights if on of filters is empty', () => {
      const highlights: SummaryHighlights = {
        chapter_id: {
          page_id: [
            {id: 'highlight'} as HighlightData,
          ],
        },
      };

      const state = reducer(initialState,
        actions.receiveSummaryHighlights(highlights)
      );

      expect(state.summary.filters.chapters.length).toEqual(0);
      expect(state.summary.highlights).toMatchObject({});
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
            chapters: ['id'],
            colors: [HighlightColorEnum.Green],
          },
        },
      },
        actions.receiveSummaryHighlights(highlights)
      );

      expect(state.summary.highlights).toMatchObject({});
    });
  });
});
