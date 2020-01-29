import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { ActionType } from 'typesafe-actions';
import { AnyAction } from '../types';
import * as actions from './actions';
import { AnyNotification, Message , State } from './types';
import { filterClosedNotification, pushNotification } from './utils';

export const initialState: State = {
  notificationQueue: [],
  queuelessNotifications: [],
};

export const appMessageType =  'Notification/appMessage' as 'Notification/appMessage';

const isNewMessage = (state: State, message: Message) =>
  !state.notificationQueue.find((existingMessage: AnyNotification) => {
  return existingMessage.type === appMessageType && existingMessage.payload.id === message.id;
});

function processAppMessages(state: State, action: ActionType<typeof actions.receiveMessages>) {
  return action.payload
    .filter((message: Message) => isNewMessage(state, message))
    .map((message: Message) => ({
      payload: message,
      type: appMessageType,
    }));
}

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.updateAvailable):
    case getType(actions.acceptCookies):
    case getType(actions.searchFailure):
      return pushNotification(state, action);
    case getType(actions.receiveMessages):
      return {...state, notificationQueue: [...state.notificationQueue, ...processAppMessages(state, action)]};
    case getType(actions.dismissNotification):
      return filterClosedNotification(state, action.payload);
    default:
      return state;
  }
};

export default reducer;
