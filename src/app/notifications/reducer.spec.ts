import flow from 'lodash/fp/flow';
import * as actions from './actions';
import reducer, { appMessageType, initialState } from './reducer';

describe('notifications reducer', () => {

  it('adds update available notification', () => {
    const newState = reducer(initialState, actions.updateAvailable());
    expect(newState.notificationQueue).toContainEqual(actions.updateAvailable());
  });

  it('doesn\'t duplicate standard notifications', () => {
    const stateWithNotifications = {
      notificationQueue: [actions.updateAvailable()],
      queuelessNotifications: [actions.searchFailure()],
    };

    const newState = flow(
      (state) => reducer(state, actions.updateAvailable()),
      (state) => reducer(state,  actions.searchFailure())
    )(stateWithNotifications);

    expect(newState).toBe(stateWithNotifications);
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
    const newState = reducer({...initialState, notificationQueue: messages}, actions.receiveMessages([
      ...messages.slice(1).map(({payload}) => payload),
      ...newMessages.map(({payload}) => payload),
    ]));
    expect(newState.notificationQueue.length).toBe(3);
    expect(newState.notificationQueue).toEqual([...messages, ...newMessages]);
  });

  it('dismissesNotification', () => {
    const acceptCookiesNotification = actions.acceptCookies();
    const searchFailureNotification = actions.searchFailure();

    const newState = flow(
      (state) => reducer(state, actions.updateAvailable()),
      (state) => reducer(state, searchFailureNotification),
      (state) => reducer(state, acceptCookiesNotification),
      (state) => reducer(state, actions.dismissNotification(acceptCookiesNotification)),
      (state) => reducer(state, actions.dismissNotification(searchFailureNotification))
    )(initialState);

    expect(newState.notificationQueue).not.toContainEqual(actions.acceptCookies());
    expect(newState.queuelessNotifications).not.toContainEqual(searchFailureNotification);
  });

  it('reduces acceptCookies', () => {
    const newState = reducer(initialState, actions.acceptCookies());
    expect(newState.notificationQueue).toContainEqual(actions.acceptCookies());
  });
});
