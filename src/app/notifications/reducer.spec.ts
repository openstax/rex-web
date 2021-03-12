import flow from 'lodash/fp/flow';
import { closeMyHighlights } from '../content/highlights/actions';
import { closeStudyGuides } from '../content/studyGuides/actions';
import * as actions from './actions';
import reducer, { appMessageType, initialState } from './reducer';
import { ToastNotification } from './types';
import { groupToasts } from './utils';

describe('notifications reducer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds update available notification', () => {
    const newState = reducer(initialState, actions.updateAvailable());
    expect(newState.modalNotifications).toContainEqual(actions.updateAvailable());
    expect(newState.toastNotifications).toEqual([]);
  });

  it('doesn\'t duplicate update available notification', () => {
    const state = {...initialState, modalNotifications: [actions.updateAvailable()]};
    const newState = reducer(state, actions.updateAvailable());
    expect(newState).toBe(state);
  });

  it('doesn\'t duplicate app messages', () => {
    const messages = [
      {
        payload: {
          dismissable: false,
          end_at: null,
          html: 'asdf',
          id: '1',
          start_at: null,
          url_regex: null,
        },
        type: appMessageType,
      },
      {
        payload: {
          dismissable: false,
          end_at: null,
          html: 'asdf',
          id: '2',
          start_at: null,
          url_regex: null,
        },
        type: appMessageType,
      },
    ];
    const newMessages = [
      {
        payload: {
          dismissable: false,
          end_at: null,
          html: 'asdf',
          id: '3',
          start_at: null,
          url_regex: null,
        },
        type: appMessageType,
      },
    ];
    const newState = reducer({...initialState, modalNotifications: messages}, actions.receiveMessages([
      ...messages.slice(1).map(({payload}) => payload),
      ...newMessages.map(({payload}) => payload),
    ]));
    expect(newState.modalNotifications.length).toBe(3);
    expect(newState.modalNotifications).toEqual([...messages, ...newMessages]);
    expect(newState.toastNotifications).toEqual([]);
  });

  it('dismissesNotification', () => {
    const acceptCookiesNotification = actions.acceptCookies();

    const newState = flow(
      (state) => reducer(state, actions.updateAvailable()),
      (state) => reducer(state, acceptCookiesNotification),
      (state) => reducer(state, actions.dismissNotification(acceptCookiesNotification))
    )(initialState);

    expect(newState.modalNotifications).not.toContainEqual(actions.acceptCookies());
    expect(newState.toastNotifications).toEqual([]);
  });

  it('reduces acceptCookies', () => {
    const newState = reducer(initialState, actions.acceptCookies());
    expect(newState.modalNotifications).toContainEqual(actions.acceptCookies());
    expect(newState.toastNotifications).toEqual([]);
  });

  describe('toast notifications', () => {
    const destination = 'page';

    it('reduces toasts', () => {
      const newState = flow(
        (state) => reducer(state, actions.addToast('mytoast', {destination})),
        (state) => reducer(state, actions.addToast('myothertoast', {destination}))
      )(initialState);

      expect(newState.modalNotifications).toEqual([]);
      expect(newState.toastNotifications).toContainEqual(expect.objectContaining({messageKey: 'mytoast'}));
      expect(newState.toastNotifications).toContainEqual(expect.objectContaining({messageKey: 'myothertoast'}));
    });

    it('refreshes the timestamp if a toast with the same message appears', async() => {
      const mockDate = jest.spyOn(Date, 'now').mockReturnValueOnce(1);

      const newState = reducer(initialState, actions.addToast('mytoast', {destination}));
      const toast = newState.toastNotifications.find((notification) => notification.messageKey === 'mytoast');

      if (!toast) {
        return expect(toast).toBeTruthy();
      }
      mockDate.mockReturnValueOnce(2);

      const initialTimestamp = toast.timestamp;
      const state = reducer(newState, actions.addToast('mytoast', {destination}));

      expect(state.toastNotifications).toContainEqual(expect.objectContaining({messageKey: 'mytoast'}));
      expect(state.toastNotifications.length).toBe(1);
      expect(state.toastNotifications).not.toContainEqual(expect.objectContaining({timestamp: initialTimestamp}));
    });

    it('keeps toasts in the order they originally appeared', () => {
      const isInOrder = (order: string[]) => (toast: ToastNotification, index: number) =>
        toast.messageKey === order[index];

      const toastsOrder = ['mytoast', 'myothertoast', 'myamazingtoast'];

      const newState = flow(
        (state) => reducer(state, actions.addToast('mytoast', {destination})),
        (state) => reducer(state, actions.addToast('myothertoast', {destination})),
        (state) => reducer(state, actions.addToast('myamazingtoast', {destination})),
        (state) => reducer(state, actions.addToast('mytoast', {destination})),
        (state) => reducer(state, actions.addToast('myothertoast', {destination}))
      )(initialState);

      const [newest] = newState.toastNotifications;

      expect(newState.toastNotifications.every(isInOrder(toastsOrder))).toBe(true);
      expect(newest.messageKey).toBe(toastsOrder[0]);

      const toastToDismiss = newState.toastNotifications[1];
      const newOrder = ['mytoast', 'myamazingtoast', 'myothertoast'];

      const afterReappearing  = flow(
        (state) => reducer(state, actions.dismissNotification(toastToDismiss)),
        (state) => reducer(state, actions.addToast(toastToDismiss.messageKey, {destination}))
      )(newState);

      expect(afterReappearing.toastNotifications.every(isInOrder(newOrder))).toBe(true);
    });

    it('closing modal clears its notifications', () => {
      const newState = flow(
        (state) => reducer(state, actions.addToast('mytoast', {destination: 'myHighlights'})),
        (state) => reducer(state, actions.addToast('mytoast2', {destination: 'myHighlights'})),
        (state) => reducer(state, actions.addToast('myothertoast', {destination: 'studyGuides'}))
      )(initialState);

      let groupedToasts = groupToasts(newState.toastNotifications);

      expect(groupedToasts.myHighlights)
        .toContainEqual(expect.objectContaining({messageKey: 'mytoast'}));
      expect(groupedToasts.myHighlights)
        .toContainEqual(expect.objectContaining({messageKey: 'mytoast2'}));
      expect(groupedToasts.studyGuides)
        .toContainEqual(expect.objectContaining({messageKey: 'myothertoast'}));

      const afterClosingMH = reducer(newState, closeMyHighlights());
      groupedToasts = groupToasts(afterClosingMH.toastNotifications);

      expect(groupedToasts.myHighlights).toBe(undefined);
      expect(groupedToasts.studyGuides)
        .toContainEqual(expect.objectContaining({messageKey: 'myothertoast'}));

      const afterClosingSG = reducer(afterClosingMH, closeStudyGuides());
      groupedToasts = groupToasts(afterClosingSG.toastNotifications);

      expect(groupedToasts.studyGuides).toBe(undefined);
    });
  });
});
