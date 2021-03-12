import { Highlight } from '@openstax/highlighter/dist/api';
import { ApplicationError } from '../../../../helpers/applicationMessageError';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { FirstArgumentType, MiddlewareAPI, Store } from '../../../types';
import { createHighlight, receiveDeleteHighlight } from '../actions';

const createMockHighlight = () => ({
  id: Math.random().toString(36).substring(7),
}) as FirstArgumentType<typeof createHighlight>;

describe('receiveDeleteHighlight', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./receiveDeleteHighlight').hookBody>;
  let highlight: ReturnType<typeof createMockHighlight>;
  let dispatch: jest.SpyInstance;

  const meta = {locationFilterId: 'id', pageId: 'id'};

  beforeEach(() => {
    store = createTestStore();

    highlight = createMockHighlight();
    store.dispatch(createHighlight(highlight, meta));

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./receiveDeleteHighlight').hookBody)(helpers);
  });

  it('deletes highlight', async() => {
    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight')
      .mockResolvedValue({} as any);

    hook(receiveDeleteHighlight(highlight as unknown as Highlight, meta));
    await new Promise((resolve) => setImmediate(resolve));

    expect(deleteHighlightClient).toHaveBeenCalledWith({id: highlight.id});
  });

  it('doesn\'t call highlightClient when reverting creation', async() => {
    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight');

    hook(receiveDeleteHighlight(highlight as unknown as Highlight, {...meta, revertingAfterFailure: true}));
    await new Promise((resolve) => setImmediate(resolve));

    expect(deleteHighlightClient).not.toHaveBeenCalled();
  });

  it('reverts deletion if it failed', async() => {
    expect.assertions(2);
    const error = {} as any;

    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight')
      .mockRejectedValue(error);

    try {
      await hook(receiveDeleteHighlight(highlight as unknown as Highlight, meta));
    } catch (error) {
      expect(deleteHighlightClient).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(createHighlight(highlight, {...meta, revertingAfterFailure: true}));
    }
  });

  it('throws HighlightDeleteError', async() => {
    expect.assertions(3);
    const error = {} as any;

    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight')
      .mockRejectedValue(error);

    try {
      await hook(receiveDeleteHighlight(highlight as unknown as Highlight, meta));
    } catch (error) {
      expect(deleteHighlightClient).toHaveBeenCalled();
      expect(error.messageKey).toBe(toastMessageKeys.higlights.failure.delete);
      expect(error.meta).toEqual({ destination: 'page' });
    }
  });

  it('throws ApplicationError', async() => {
    expect.assertions(3);
    const mockCustomApplicationError = new ApplicationError('error');

    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight')
      .mockRejectedValue(mockCustomApplicationError);

    try {
      await hook(receiveDeleteHighlight(highlight as unknown as Highlight, meta));
    } catch (error) {
      expect(deleteHighlightClient).toHaveBeenCalled();
      expect(error instanceof ApplicationError).toEqual(true);
      expect(error.message).toBe(mockCustomApplicationError.message);
    }
  });
});
