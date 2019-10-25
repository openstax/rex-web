import { SerializedHighlight } from '@openstax/highlighter';
import { receiveFeatureFlags } from '../../actions';
import * as actions from './actions';
import { highlightingFeatureFlag } from './constants';
import reducer, { initialState } from './reducer';

const mockHighlight = {
  id: 'asdf',
} as SerializedHighlight['data'];

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

  it('creates highlights', () => {
    const state = reducer(undefined, actions.createHighlight(mockHighlight));
    expect(state.highlights.length).toEqual(1);
    expect(state.highlights[0].id).toEqual('asdf');
  });

  it('removes highlights', () => {
    const state = reducer({
      ...initialState,
      highlights: [mockHighlight],
    }, actions.deleteHighlight(mockHighlight.id));
    expect(state.highlights.length).toEqual(0);
  });

  it('updates highlights', () => {
    const mock1 = mockHighlight;
    const mock2 = {...mockHighlight};
    const mock3 = {...mockHighlight, id: 'qwer'};

    const state = reducer({
      ...initialState,
      highlights: [mock1, mock3],
    }, actions.updateHighlight(mock2));

    expect(state.highlights[0]).not.toBe(mock1);
    expect(state.highlights[0]).toBe(mock2);
    expect(state.highlights[1]).toBe(mock3);
  });
});
