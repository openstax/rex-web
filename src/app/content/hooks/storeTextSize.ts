import { ActionHookBody } from '../../types';
import { setTextSize } from '../actions';
import { textSize } from '../selectors';

const hookBody: ActionHookBody<typeof setTextSize> = (services) => async() => {
  const { getState } = services;

  const state = getState();

  if (window) {
    window.localStorage.setItem('textSize', textSize(state).toString());
  }
};

export default hookBody;
