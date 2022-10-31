import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { page } from '../../../../test/mocks/archiveLoader';
import { scrollTarget } from '../../../navigation/selectors';
import { FirstArgumentType, MiddlewareAPI, Store } from '../../../types';
import { receivePage } from '../../actions';
import { createHighlight, receiveDeleteHighlight, requestDeleteHighlight } from '../actions';
import { HighlightData } from '../types';

const createMockHighlight = () => ({
  id: Math.random().toString(36).substring(7),
}) as HighlightData;

describe('requestDeleteHighlight', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./requestDeleteHighlight').hookBody>;
  let highlight: ReturnType<typeof createMockHighlight>;
  let dispatch: jest.SpyInstance;

  const meta = {locationFilterId: 'id', pageId: 'id'};

  beforeEach(() => {
    store = createTestStore();

    highlight = createMockHighlight();
    store.dispatch(createHighlight(highlight as any as FirstArgumentType<typeof createHighlight>, meta));

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./requestDeleteHighlight').hookBody)(helpers);
  });

  it('calls receiveDeleteHighlight', () => {
    hook(requestDeleteHighlight(highlight, meta));

    expect(dispatch).toHaveBeenCalledWith(receiveDeleteHighlight(highlight, meta));
  });

  it('calls receiveDeleteHighlight and clears scroll target', () => {
    const mockScrollTarget = `target=${JSON.stringify({ type: 'highlight', id: highlight.id })}`;
    store.dispatch(receivePage({...page, references: []}));

    expect(scrollTarget(store.getState())).toBeTruthy();

    hook(requestDeleteHighlight(highlight, meta));

    expect(dispatch).toHaveBeenCalledWith(receiveDeleteHighlight(highlight, meta));
    expect(scrollTarget(store.getState())).toEqual(null);
  });
});
