import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { AnyAction } from '../types';
import * as actions from './actions';
import { Message, State, AppMessagesAction, AppMessageNotification } from './types';
import { isAppMessageDismissed } from './dismissAppMessages'

import {	
  find,
  isUndefined,
  flow,
} from 'lodash/fp';

import {
  isBefore,
  startOfToday,
  endOfToday,
} from 'date-fns';

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
  if (message.start_at){
    if (isBefore(startOfToday(), new Date(message.start_at))) {
      return false
    }
  }
  if (message.end_at){
    if (isBefore(new Date(message.end_at), endOfToday())) {
      return false
    }
  }
  return true
}

function isURLMatch(message: Message) {
  if (message.url_regex) {
    return false
  }
  console.log(message)
  return true
}

function isNotDismissed(message: Message) {
  return !isAppMessageDismissed(message)
}

function filterForMessageToAdd(state: State, action: AppMessagesAction) {	
  return action.payload
    .filter((message: Message) => (	
      isNotInNotifications(message, state) &&
        isCurrent(message) &&
        isNotDismissed(message) &&
        isURLMatch(message)
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
