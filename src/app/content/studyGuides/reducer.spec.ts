import { locationChange } from '../../navigation/actions';
import { HighlightData, SummaryHighlights } from '../highlights/types';
import * as actions from './actions';
import reducer, { initialState } from './reducer';

describe('study guides reducer', () => {
  it('keeps summary open on location change if modal query is present', () => {
    const mockState = {
      ...initialState,
      summary: {...initialState.summary, open: true},
    };

    const state = reducer(
      mockState,
      locationChange({action: 'PUSH', location: {state: {pageUid: 'asdf'}, search: '?modal=SG'}} as any));
    expect(state.summary.open).toBe(true);
  });

  it('receive study guides', () => {
    const summary = {
      location: {
        page: [],
      },
    } as SummaryHighlights;
    const state = reducer(undefined, actions.receiveSummaryStudyGuides(summary, {pagination: null}));

    expect(state.summary.studyGuides).toEqual(summary);
  });

  it('sets summary filters', () => {
    const state = reducer({
      ...initialState,
      summary: {
        ...initialState.summary,
        filters: {
          colors: [],
          default: false,
          locationIds: [],
        },
      },
    }, actions.setSummaryFilters({
      locationIds: ['id'],
    }));

    expect(state.summary.filters.locationIds[0]).toEqual('id');
    expect(state.summary.filters.locationIds.length).toEqual(1);
    expect(state.summary.loading).toEqual(true);
  });

  it('noops for receive summary study guides with stale filters', () => {
    const highlights: SummaryHighlights = {
      chapter_id: {
        page_id: [
          {id: 'highlight'} as HighlightData,
        ],
      },
    };

    const staleFilters = {
      colors: initialState.summary.filters.colors,
      default: initialState.summary.filters.default,
      locationIds: [],
    };

    const state = reducer(
      initialState,
      actions.receiveSummaryStudyGuides(highlights, {pagination: null, filters: staleFilters }));

    expect(state).toEqual(initialState);
  });
});
