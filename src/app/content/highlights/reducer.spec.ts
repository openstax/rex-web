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
});
