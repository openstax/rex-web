import { receiveFeatureFlags } from '../../featureFlags/actions';
import { locationChange } from '../../navigation/actions';
import { studyGuidesFeatureFlag } from '../constants';
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

  it('updates color filters with passed parameters on location change if colors query is present', () => {
    const mockState = {
      ...initialState,
      summary: {...initialState.summary, open: true, filters: { ...initialState.summary.filters, colors: [] }},
    };

    let state = reducer(
      mockState,
      locationChange({
        action: 'REPLACE',
        location: {
          search: '?modal=SG&colors=green&colors=yellow',
          state: {pageUid: 'asdf'},
        },
      } as any));
    expect(state.summary.filters.colors).toEqual(['green', 'yellow']);

    state = reducer(
      mockState,
      locationChange({
        action: 'REPLACE',
        location: {
          search: '?modal=SG&colors=green',
          state: {pageUid: 'asdf'},
        },
      } as any));
    expect(state.summary.filters.colors).toEqual(['green']);

    state = reducer(
      mockState,
      locationChange({
        action: 'REPLACE',
        location: {
          search: '?modal=SG&colors=wrong-color',
          state: {pageUid: 'asdf'},
        },
      } as any));
    expect(state.summary.filters.colors).toEqual([]);
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

  it('enables study guides on receiveFeatureFlags', () => {
    const state = reducer(initialState, receiveFeatureFlags([studyGuidesFeatureFlag]));
    expect(state.isEnabled).toEqual(true);
  });
});
