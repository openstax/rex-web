import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { resetModules } from '../../../../test/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { deleteHighlight } from '../actions';

describe('locationChange', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./removeHighlight').hookBody>;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    hook = (require('./removeHighlight').hookBody)(helpers);
  });

  it('deletes highlight', async() => {
    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight');
    await hook(deleteHighlight('1'));
    expect(deleteHighlightClient).toHaveBeenCalledWith({id: '1'});
  });
});
