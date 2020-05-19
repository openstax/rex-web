import * as actions from './actions';
import reducer from './reducer';
import { StudyGuides } from './types';

describe('study guides reducer', () => {
  it('receive study guides', () => {
    const summary = { asd: 'asd' } as any as StudyGuides;
    const state = reducer(undefined, actions.receiveStudyGuides(summary));

    expect(state.summary).toBe(summary);
  });
});
