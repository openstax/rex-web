import * as actions from './actions';
import reducer from './reducer';
import { StudyGuides } from './types';

describe('study guids reducer', () => {
  it('receive study guids', () => {
    const studyGuids = { asd: 'asd' } as any as StudyGuides;
    const state = reducer(undefined, actions.receiveStudyGuides(studyGuids));

    expect(state.studyGuides).toBe(studyGuids);
  });
});
