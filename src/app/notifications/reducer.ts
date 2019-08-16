import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { AnyAction } from '../types';
import * as actions from './actions';
import { State, AppMessagesAction, Message } from './types';
import {
  find,
  // isMatch, find, pick, flow, isUndefined,
  // overEvery
} from 'lodash/fp';
// import dateFns from 'date-fns';

export const initialState = [];

function isNotInNotifications(state: State, message: Message) {
  return find((existingMessage: Message) => (
    existingMessage.id === message.id
  ))(state)
}

// function isCurrent(state: State, action: AnyAction) {
  
// }

function filterForMessageToAdd(state: State, action: AppMessagesAction) {
  return action.payload
    .filter((message: Message) => (
      isNotInNotifications(state, message)
    ))
    .map((message: Message) => ({
      payload: message,
      type: 'Notification/appMessage',
    }))
}

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.updateAvailable):
    case getType(actions.acceptCookies):
      return state.find(({type}) => type === action.type)
        ? state
        : [...state, action];
    case getType(actions.appMessage):

      let newMessages = filterForMessageToAdd(state, action);

      return [...state, ...newMessages];
    case getType(actions.dismissNotification):
      return state.filter((notification) => notification !== action.payload);
    default:
      return state;
  }
};

export default reducer;
