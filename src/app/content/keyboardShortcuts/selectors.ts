import { createSelector } from 'reselect';
import * as navigationSelectors from '../../navigation/selectors';
import { modalUrlName } from './constants';

export const isKeyboardShortcutsOpen = createSelector(
  navigationSelectors.query, (query) => query && query.modal === modalUrlName
);
