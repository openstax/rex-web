import { receiveFeatureFlags } from '../../actions';
import { studyGuidesFeatureFlag } from '../constants';
import { SummaryHighlights } from '../highlights/types';
import * as actions from './actions';
import reducer, { initialState } from './reducer';

describe('study guides reducer', () => {
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
