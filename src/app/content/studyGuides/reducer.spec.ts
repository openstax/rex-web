import { receiveFeatureFlags } from '../../actions';
import { studyGuidesFeatureFlag } from '../constants';
import { SummaryHighlights } from '../types';
import * as actions from './actions';
import reducer, { initialState } from './reducer';

describe('study guides reducer', () => {
  it('receive study guides', () => {
    const summary = {
      location: {
        page: [],
      },
    } as SummaryHighlights;
    const state = reducer(undefined, actions.receiveSummaryStudyGuides(summary, null));

    expect(state.summary.highlights).toEqual(summary);
  });

  it('enables study guides on receiveFeatureFlags', () => {
    const state = reducer(initialState, receiveFeatureFlags([studyGuidesFeatureFlag]));
    expect(state.isEnabled).toEqual(true);
  });
});
