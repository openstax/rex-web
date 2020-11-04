import { locationChange } from '../../navigation/actions';
import reducer, { initialState } from './reducer';

describe('practice questions reducer', () => {
  it('keeps modal open on location change if modal query is present', () => {
    const mockState = {
      ...initialState,
      open: true,
    };

    const state = reducer(
      mockState,
      locationChange({action: 'PUSH', location: {state: {pageUid: 'asdf'}, search: '?modal=PQ'}} as any));
    expect(state.open).toBe(true);
  });

  it('closes modal on location change if modal query is not present', () => {
    const mockState = {
      ...initialState,
      open: true,
    };

    const state = reducer(
      mockState,
      locationChange({action: 'PUSH', location: {state: {pageUid: 'asdf'}, search: ''}} as any));
    expect(state.open).toBe(false);
  });
});
