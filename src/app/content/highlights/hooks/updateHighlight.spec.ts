import { HighlightUpdateColorEnum, UpdateHighlightRequest } from '@openstax/highlighter/dist/api';
import { ApplicationError } from '../../../../helpers/applicationMessageError';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { MiddlewareAPI, Store } from '../../../types';
import { assertDefined } from '../../../utils';
import { createHighlight, openMyHighlights, updateHighlight } from '../actions';
import { NewHighlightPayload } from '../types';

jest.mock('../../../../helpers/Sentry');

const mockHighlight = () => {
  const id = Math.random().toString(36).substring(7);

  return {
    annotation: 'asdf',
    color: 'red' as string,
    id,
  } as NewHighlightPayload;
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
    await new Promise((resolve) => setImmediate(resolve));

    expect(updateHighlightClient).toHaveBeenCalledWith(updatePayload);
  });

  it('doesn\'t call highlightClient when reverting updates', async() => {
    const updateHighlightClient = jest.spyOn(helpers.highlightClient, 'updateHighlight')
      .mockResolvedValue({} as any);

    hook(updateHighlight(
      highlightUpdatePayload(highlight.id, {color: 'red', annotation: 'new'}),
      {...meta, revertingAfterFailure: true}
    ));
    await new Promise((resolve) => setImmediate(resolve));

    expect(updateHighlightClient).not.toHaveBeenCalled();
  });

  it('reverts update if it would result in the same highlight', async() => {
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
    await new Promise((resolve) => setImmediate(resolve));

    expect(updateHighlightClient).toHaveBeenCalledWith(updatePayload);

    expect(dispatch).not.toHaveBeenCalledWith(updateHighlight(
      meta.preUpdateData,
      {...meta, revertingAfterFailure: true}
    ));
  });

  it('reverts an update if it failed', async() => {
    expect.assertions(2);
    const error = {} as any;

    const updateHighlightClient = jest.spyOn(helpers.highlightClient, 'updateHighlight')
      .mockRejectedValue(error);

    const updatePayload = highlightUpdatePayload(highlight.id, {color: 'red', annotation: 'new'});
    try {
      await hook(updateHighlight(updatePayload, meta));
    } catch (error) {
      expect(updateHighlightClient).toHaveBeenCalledWith(updatePayload);
      expect(dispatch).toHaveBeenCalledWith(updateHighlight(
        meta.preUpdateData, { ...meta, revertingAfterFailure: true }
      ));
    }
  });

  it('throws HighlightUpdateColorError', async() => {
    expect.assertions(3);
    const error = {} as any;
    const oldHighlight = {
      annotation: assertDefined(highlight.annotation, 'annotation disappeared'),
      color: highlight.color,
    };

    const colorUpdate = highlightUpdatePayload(highlight.id, {...oldHighlight, color: 'something new'});

    const updateHighlightClient = jest.spyOn(helpers.highlightClient, 'updateHighlight')
      .mockRejectedValue(error);

    try {
      await hook(updateHighlight(colorUpdate, meta));
    } catch (error) {
      expect(updateHighlightClient).toHaveBeenCalledWith(colorUpdate);
      expect(error.messageKey).toBe(toastMessageKeys.higlights.failure.update.color);
      expect(error.meta).toEqual({ destination: 'page' });
    }
  });

  it('throws HighlightUpdateAnnotationError', async() => {
    expect.assertions(6);
    const error = {} as any;
    const oldHighlight = {
      annotation: assertDefined(highlight.annotation, 'annotation disappeared'),
      color: highlight.color,
    };

    const annotationUpdate = highlightUpdatePayload(highlight.id, {...oldHighlight, annotation: 'something else'});

    const updateHighlightClient = jest.spyOn(helpers.highlightClient, 'updateHighlight')
      .mockRejectedValue(error);

    try {
      await hook(updateHighlight(annotationUpdate, meta));
    } catch (error) {
      expect(updateHighlightClient).toHaveBeenCalledWith(annotationUpdate);
      expect(error.messageKey).toBe(toastMessageKeys.higlights.failure.update.annotation);
      expect(error.meta).toEqual({ destination: 'page' });
    }

    // getHighlightToastDesination will change destination to myHighlights
    store.dispatch(openMyHighlights());

    try {
      await hook(updateHighlight(annotationUpdate, meta));
    } catch (error) {
      expect(updateHighlightClient).toHaveBeenCalledWith(annotationUpdate);
      expect(error.messageKey).toBe(toastMessageKeys.higlights.failure.update.annotation);
      expect(error.meta).toEqual({ destination: 'myHighlights' });
    }
  });

  it('throws ApplicationError', async() => {
    expect.assertions(3);
    const mockCustomApplicationError = new ApplicationError('error');

    const updatePayload = highlightUpdatePayload(highlight.id, { color: 'red', annotation: 'new' });

    const updateHighlightClient = jest.spyOn(helpers.highlightClient, 'updateHighlight')
      .mockRejectedValue(mockCustomApplicationError);

    try {
      await hook(updateHighlight(updatePayload, meta));
    } catch (error) {
      expect(updateHighlightClient).toHaveBeenCalledWith(updatePayload);
      expect(error instanceof ApplicationError).toEqual(true);
      expect(error.message).toBe(mockCustomApplicationError.message);
    }
  });
});
