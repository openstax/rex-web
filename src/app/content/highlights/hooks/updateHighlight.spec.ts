import { NewHighlight, UpdateHighlightRequest } from '@openstax/highlighter/dist/api';
import Sentry from '../../../../helpers/Sentry';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { toastNotifications } from '../../../notifications/selectors';
import { MiddlewareAPI, Store } from '../../../types';
import { createHighlight, updateHighlight } from '../actions';

jest.mock('../../../../helpers/Sentry');

const mockHighlight = () => {
  const id = Math.random().toString(36).substring(7);

  return {
    annotation: 'asdf',
    color: 'red' as string,
    id,
  } as NewHighlight & {id: string};
};

const highlightUpdatePayload = (id: string, toChange: {color: string, annotation: string}) => {
  return {
    highlight: { color: toChange.color, annotation: toChange.annotation },
    id,
  } as UpdateHighlightRequest;
};

describe('updateHighlight', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./updateHighlight').hookBody>;
  let highlight: ReturnType<typeof mockHighlight>;
  let dispatch: jest.SpyInstance;

  const meta = {locationFilterId: 'id', pageId: 'id'};

  beforeEach(() => {
    store = createTestStore();

    highlight = mockHighlight();
    store.dispatch(createHighlight(highlight, meta));

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./updateHighlight').hookBody)(helpers);
  });

  it('updates highlight', async() => {
    const updateHighlightClient = jest.spyOn(helpers.highlightClient, 'updateHighlight')
      .mockResolvedValue({} as any);
    const updatePayload = highlightUpdatePayload(highlight.id, {color: 'red', annotation: 'new'});

    hook(updateHighlight(updatePayload, meta));

    await Promise.resolve();

    expect(updateHighlightClient).toHaveBeenCalledWith(updatePayload);
  });

  it('doesn\'t call highlightClient when reverting updates', async() => {
    const updateHighlightClient = jest.spyOn(helpers.highlightClient, 'updateHighlight')
      .mockResolvedValue({} as any);

    hook(updateHighlight(
      highlightUpdatePayload(highlight.id, {color: 'red', annotation: 'new'}),
      {...meta, revertingAfterFailure: true}
    ));

    await Promise.resolve();

    expect(updateHighlightClient).not.toHaveBeenCalled();
  });

  it('reverts an update if it failed', async() => {
    const error = {} as any;

    const updateHighlightClient = jest.spyOn(helpers.highlightClient, 'updateHighlight')
      .mockRejectedValue(error);
    const updatePayload = highlightUpdatePayload(highlight.id, {color: 'red', annotation: 'new'});

    hook(updateHighlight(updatePayload, meta));

    await Promise.resolve();

    expect(updateHighlightClient).toHaveBeenCalledWith(updatePayload);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);

    expect(dispatch).toHaveBeenCalledWith(updateHighlight(
      expect.objectContaining({highlight}),
      expect.objectContaining({revertingAfterFailure: true}))
    );

    const hasAdequateErrorToast = toastNotifications(store.getState())
      .some((notification) => notification.messageKey === 'i18n:notification:toast:highlights:update-failure');

    expect(hasAdequateErrorToast).toBe(true);
  });
});
