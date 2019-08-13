import flow from 'lodash/fp/flow';
import * as actions from './actions';
import reducer, { initialState } from './reducer';

describe('notifications reducer', () => {

  it('adds update available notification', () => {
    const newState = reducer(initialState, actions.updateAvailable());
    expect(newState).toContainEqual(actions.updateAvailable());
  });

  it('doesn\'t duplicate update available notification', () => {
    const state = [actions.updateAvailable()];
    const newState = reducer(state, actions.updateAvailable());
    expect(newState).toBe(state);
  });

  it('dismissesNotification', () => {
    const acceptCookiesNotification = actions.acceptCookies();

    const newState = flow(
      (state) => reducer(state, actions.updateAvailable()),
      (state) => reducer(state, acceptCookiesNotification),
      (state) => reducer(state, actions.dismissNotification(acceptCookiesNotification))
    )(initialState);

    expect(newState).not.toContainEqual(actions.acceptCookies());
  });

  it('reduces acceptCookies', () => {
    const newState = reducer(initialState, actions.acceptCookies());
    expect(newState).toContainEqual(actions.acceptCookies());
  });
});
