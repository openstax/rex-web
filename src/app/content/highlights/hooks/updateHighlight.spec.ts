import { HighlightUpdateColorEnum, NewHighlight, UpdateHighlightRequest } from '@openstax/highlighter/dist/api';
import Sentry from '../../../../helpers/Sentry';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { toastNotifications } from '../../../notifications/selectors';
import { MiddlewareAPI, Store } from '../../../types';
import { assertDefined } from '../../../utils';
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
  let meta: ReturnType<typeof updateHighlight>['meta'];

  beforeEach(() => {
    store = createTestStore();

    highlight = mockHighlight();
    meta = {
      locationFilterId: 'id',
      pageId: 'id',
      preUpdateData: {
        highlight: {
          annotation: highlight.annotation,
          color: highlight.color as string as HighlightUpdateColorEnum,
        },
        id: highlight.id,
      },
    };

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

  it('doesn\'t show toast / revert update if it would result in the same highlight', async() => {
    const error = {} as any;
    const oldHighlight = {
      annotation: assertDefined(highlight.annotation, 'annotation disappeared'),
      color: highlight.color,
    };

    const updateHighlightClient = jest.spyOn(helpers.highlightClient, 'updateHighlight')
      .mockRejectedValue(error);
    const updatePayload = highlightUpdatePayload(
      highlight.id, oldHighlight
    );

    hook(updateHighlight(updatePayload, meta));
    await Promise.resolve();

    expect(updateHighlightClient).toHaveBeenCalledWith(updatePayload);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);

    expect(dispatch).not.toHaveBeenCalledWith(updateHighlight(
      meta.preUpdateData,
      {...meta, revertingAfterFailure: true}
    ));

    expect(toastNotifications(store.getState())).toEqual([]);
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

    expect(dispatch).toHaveBeenCalledWith(updateHighlight(meta.preUpdateData, {...meta, revertingAfterFailure: true}));
  });

  it('shows appropriate toast after failure', async() => {
    const error = {} as any;
    const oldHighlight = {
      annotation: assertDefined(highlight.annotation, 'annotation disappeared'),
      color: highlight.color,
    };

    const colorUpdate = highlightUpdatePayload(highlight.id, {...oldHighlight, color: 'something new'});
    const annotationUpdate = highlightUpdatePayload(highlight.id, {...oldHighlight, annotation: 'something else'});

    const updateHighlightClient = jest.spyOn(helpers.highlightClient, 'updateHighlight')
      .mockRejectedValue(error);

    hook(updateHighlight(colorUpdate, meta));
    await Promise.resolve();

    expect(updateHighlightClient).toHaveBeenCalledWith(colorUpdate);
    expect(toastNotifications(store.getState()).some(
      (notification) => notification.messageKey === 'i18n:notification:toast:highlights:update-failure:color'
    )).toBe(true);

    hook(updateHighlight(annotationUpdate, meta));
    await Promise.resolve();

    expect(updateHighlightClient).toHaveBeenCalledWith(annotationUpdate);
    expect(toastNotifications(store.getState()).some(
      (notification) => notification.messageKey === 'i18n:notification:toast:highlights:update-failure:annotation'
    )).toBe(true);
  });
});
