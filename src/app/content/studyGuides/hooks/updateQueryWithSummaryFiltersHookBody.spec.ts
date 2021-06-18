import { HighlightColorEnum } from '@openstax/highlights-client';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { initialState as initialContentState } from '../../../content/reducer';
import { replace } from '../../../navigation/actions';
import * as navigation from '../../../navigation/selectors';
import { MiddlewareAPI, Store } from '../../../types';
import { updateSummaryFilters } from '../actions';

describe('openModal', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hookBody: typeof import ('./updateQueryWithSummaryFiltersHookBody').hookBody;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore({
      content: initialContentState,
    });

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hookBody = (require('./updateQueryWithSummaryFiltersHookBody').hookBody);
  });

  it('sets correct location if there was match in the navigation state', () => {
    const mockMatch = {} as any;
    jest.spyOn(navigation, 'match')
      .mockReturnValue(mockMatch);
    jest.spyOn(navigation, 'query')
      .mockReturnValue({ modal: 'SG' });

    hookBody(helpers)(updateSummaryFilters({ colors: { new: [], remove: [HighlightColorEnum.Green] } }));

    expect(dispatch).toHaveBeenCalledWith(replace(mockMatch, {
      search: 'colors=yellow&colors=blue&colors=purple&modal=SG',
    }));
  });

  it('noops if match wansn\'t in the navigation state', () => {
    jest.spyOn(navigation, 'match')
      .mockReturnValue(undefined);

    hookBody(helpers)(updateSummaryFilters({ colors: { new: [], remove: [HighlightColorEnum.Green] } }));

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops if colors weren\'t updated', () => {
    const mockMatch = {} as any;
    jest.spyOn(navigation, 'match')
      .mockReturnValue(mockMatch);
    jest.spyOn(navigation, 'query')
      .mockReturnValue({ modal: 'SG' });

    hookBody(helpers)(updateSummaryFilters({}));

    expect(dispatch).not.toHaveBeenCalled();
  });
});
