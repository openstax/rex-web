import { Location, MediaQueryList } from '@openstax/types/lib.dom';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { receiveLoggedOut } from '../../auth/actions';
import { AppServices, MiddlewareAPI, Store } from '../../types';
import { closeCallToActionPopup, openCallToActionPopup } from '../actions';
import { content } from '../routes';
import * as CTAHooks from './signupCTAHooks';

jest.useFakeTimers();

describe('signupCTAHooks hooks', () => {
  let hookShow: ReturnType<typeof CTAHooks.receiveLoggedOutHookBody>;
  let hookClose: ReturnType<typeof CTAHooks.locationChangeHookBody>;
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: MiddlewareAPI & AppServices;

  beforeEach(() => {
    store = createTestStore();

    dispatch = jest.spyOn(store, 'dispatch');

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    hookShow = CTAHooks.receiveLoggedOutHookBody(helpers);
    hookClose = CTAHooks.locationChangeHookBody(helpers);
  });

  it('does not dispatch openCallToActionPopup if user is on mobile', async() => {
    window!.matchMedia = () => ({matches: true}) as MediaQueryList;

    await hookShow(receiveLoggedOut());

    expect(setTimeout).not.toHaveBeenCalled();
  });

  it('dispatches openCallToActionPopup after 5 seconds if user is not logged in', async() => {
    window!.matchMedia = () => ({matches: false}) as MediaQueryList;

    await hookShow(receiveLoggedOut());

    expect(setTimeout).toHaveBeenCalledTimes(1);

    jest.runTimersToTime(5000);

    expect(dispatch).toHaveBeenCalledWith(openCallToActionPopup());
  });

  it('closes popup on location change', async() => {
    store.dispatch(openCallToActionPopup());

    await hookClose({
      location: {} as Location,
      match: {
        params: {
          book: 'book-slug-1',
          page: 'test-page-1',
        },
        route: content,
      },
    } as any);

    expect(dispatch).toHaveBeenCalledWith(closeCallToActionPopup());
  });

  it('does not dispatch if popup is not open', async() => {
    await hookClose({
      location: {} as Location,
      match: {
        params: {
          book: 'book-slug-1',
          page: 'test-page-1',
        },
        route: content,
      },
    } as any);

    expect(dispatch).not.toHaveBeenCalled();
  });
});
