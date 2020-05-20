import { receiveFeatureFlags } from '../../actions';
import { studyGuidesFeatureFlag } from '../constants';
import * as actions from './actions';
import reducer, { initialState } from './reducer';
import { StudyGuides } from './types';

describe('study guides reducer', () => {
  it('receive study guides', () => {
    const summary = { asd: 'asd' } as any as StudyGuides;
    const state = reducer(undefined, actions.receiveStudyGuides(summary));

    expect(state.summary).toBe(summary);
  });

  it('enables study guides on receiveFeatureFlags', () => {
    const state = reducer(initialState, receiveFeatureFlags([studyGuidesFeatureFlag]));
    expect(state.isEnabled).toEqual(true);
  });
});
