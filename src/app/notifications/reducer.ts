import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { AnyAction } from '../types';
import * as actions from './actions';
import { Message, State, AppMessagesAction, AppMessageNotification } from './types';
import {	
  find,
  isUndefined,
  flow,
} from 'lodash/fp';

export const initialState = [];

function isNotInNotifications(message: Message, state: State) {
  return flow(
    find((existingMessage: Message) => {
      return existingMessage.id !== message.id
    }),
    isUndefined,
  )(state)
}

function isCurrent(message: Message) {
  console.log(message)
  return true
}

function filterForMessageToAdd(state: State, action: AppMessagesAction) {	
  return action.payload
    .filter((message: Message) => (	
      isNotInNotifications(message, state) &&
        isCurrent(message)
    ))	
    .map((message: Message) => ({	
      payload: message,	
      type: 'Notification/appMessage',
    } as AppMessageNotification))
}

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.updateAvailable):
    case getType(actions.acceptCookies):
      return state.find(({type}) => type === action.type)
        ? state
        : [...state, action];
    case getType(actions.appMessage):
      return [...state, ...filterForMessageToAdd(state, action)];
    case getType(actions.dismissNotification):
      return state.filter((notification) => notification !== action.payload);
    default:
      return state;
  }
};

export default reducer;
