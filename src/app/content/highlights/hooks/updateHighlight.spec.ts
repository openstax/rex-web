import { UpdateHighlightRequest } from '@openstax/highlighter/dist/api';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { resetModules } from '../../../../test/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { updateHighlight } from '../actions';

const updateMockHighlight = () => {
  const id = Math.random().toString(36).substring(7);

  return {
    highlight: {color: 'red' as string, annotation: 'asdf'},
    id,
  } as UpdateHighlightRequest;
};

describe('locationChange', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./updateHighlight').hookBody>;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    hook = (require('./updateHighlight').hookBody)(helpers);
  });

  it('updates highlight', async() => {
    const updateHighlightClient = jest.spyOn(helpers.highlightClient, 'updateHighlight');
    const mock = updateMockHighlight();

    await hook(updateHighlight(mock, {locationFilterId: 'id', pageId: 'id'}));

    expect(updateHighlightClient).toHaveBeenCalledWith(mock);
  });
});
