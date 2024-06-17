import { ActionHookBody, AppServices, MiddlewareAPI } from '../../types';
import { setTextSize } from '../actions';
import {
  textResizerDefaultValue,
  textResizerStorageKey,
  TextResizerValue,
  textResizerValues,
} from '../constants';
import { textSize } from '../selectors';

export const loadStoredTextSize = (services: MiddlewareAPI & AppServices) => async() => {
  const { getState, dispatch, launchToken } = services;
  const state = getState();
  let storedTextSize;
  let value: TextResizerValue = textResizerDefaultValue;

  if (state.content.textSize !== null) {
    return;
  }

  if (typeof launchToken?.tokenData.textSize === 'number') {
    storedTextSize = launchToken.tokenData.textSize;
  }

  if (storedTextSize === undefined && typeof window !== 'undefined') {
    try {
      storedTextSize = parseInt(window.localStorage.getItem(textResizerStorageKey) ?? '', 10);
    } catch {
      // They have blocked access to localStorage; ignore it
    }
  }

  if (storedTextSize && textResizerValues.includes(storedTextSize as TextResizerValue)) {
    value = storedTextSize as TextResizerValue;
  }

  dispatch(setTextSize(value));
};

const hookBody: ActionHookBody<typeof setTextSize> = (services) => async() => {
  const { getState } = services;
  const state = getState();
  const value = textSize(state);

  if (typeof window !== 'undefined' && value !== null) {
    try {
      window.localStorage.setItem(textResizerStorageKey, value.toString());
    } catch {
      // They have blocked access to localStorage; ignore it
    }
  }
};

export default hookBody;
