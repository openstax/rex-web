import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { ActionType } from 'typesafe-actions';
import { closeMyHighlights } from '../content/highlights/actions';
import { closeStudyGuides } from '../content/studyGuides/actions';
import { AnyAction } from '../types';
import * as actions from './actions';
import { isToastNotification } from './guards';
import { Message, State } from './types';

export const initialState: State = {
  modalNotifications: [],
  toastNotifications: [],
};

export const appMessageType =  'Notification/appMessage' as 'Notification/appMessage';

const isNewMessage = (state: State, message: Message) =>
  !state.modalNotifications.find((existingMessage) => {
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
      return state.modalNotifications.find(({type}) => type === action.type)
        ? state
        : {
          ...state,
          modalNotifications: [...state.modalNotifications, action],
        };
    case getType(actions.receiveMessages):
      return {
        ...state,
        modalNotifications: [...state.modalNotifications, ...processAppMessages(state, action)],
      };
    case getType(actions.addToast): {
      const sameToast = state.toastNotifications.find((toast) =>
        toast.messageKey === action.payload.messageKey
        && toast.destination === action.payload.destination
        && toast.errorId === action.payload.errorId
      );

      if (sameToast) {
        return {
          ...state,
          toastNotifications: state.toastNotifications.map(
            (toast) => toast === sameToast ? {...toast, timestamp: action.payload.timestamp} : toast
          ),
        };
      }

      return {
        ...state,
        toastNotifications: [
          ...state.toastNotifications,
          action.payload,
        ],
      };
    }
    case getType(closeStudyGuides): {
      return {
        ...state,
        toastNotifications: state.toastNotifications.filter((toast) => toast.destination !== 'studyGuides'),
      };
    }
    case getType(closeMyHighlights): {
      return {
        ...state,
        toastNotifications: state.toastNotifications.filter((toast) => toast.destination !== 'myHighlights'),
      };
    }
    case getType(actions.dismissNotification): {
      const notificationToDelete = action.payload;

      if (isToastNotification(notificationToDelete)) {
        return {
          ...state,
          toastNotifications: state.toastNotifications.filter((toast) =>
            toast.messageKey !== notificationToDelete.messageKey
          ),
        };
      }

      return {
        ...state,
        modalNotifications: state.modalNotifications.filter((notification) => notification !== notificationToDelete),
      };
    }
    default:
      return state;
  }
};

export default reducer;
