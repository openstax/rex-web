import { ActionHookBody, AppServices, MiddlewareAPI } from '../../types';
import { setTextSize } from '../actions';
import {
  textResizerDefaultValue,
  textResizerStorageKey,
  TextResizerValue,
  textResizerValues
} from '../constants';
import { textSize } from '../selectors';

export const loadStoredTextSize = (services: MiddlewareAPI & AppServices) => async() => {
  const { getState, dispatch } = services;
  const state = getState();
  let storedTextSize;
  let value: TextResizerValue = textResizerDefaultValue;

  if (state.content.textSize !== null) {
    return;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    storedTextSize = window.localStorage.getItem(textResizerStorageKey);
  }

  if (storedTextSize) {
    const parsedValue = parseInt(storedTextSize, 10) as TextResizerValue;
    if (!isNaN(parsedValue) && textResizerValues.includes(parsedValue)) {
      value = parsedValue;
    }
  }

  dispatch(setTextSize(value));
};

const hookBody: ActionHookBody<typeof setTextSize> = (services) => async() => {
  const { getState } = services;
  const state = getState();
  const value = textSize(state);

  if (typeof window !== 'undefined' && value !== null) {
    window.localStorage.setItem(textResizerStorageKey, value.toString());
  }
};

export default hookBody;
