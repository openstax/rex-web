import { AppState } from '../../types';
import { modalUrlName } from './constants';
import * as selectors from './selectors';

describe('isKeyboardShortcutsOpen', () => {
  it('returns true if it has a query with the modal url', () => {
    const rootState = ({navigation: {query: {modal: modalUrlName}}} as any) as AppState;

    expect(selectors.isKeyboardShortcutsOpen(rootState)).toBe(true);
  });

  it('returns false if doesnt have a query', () => {
    const rootState = ({navigation: {},} as any) as AppState;

    expect(selectors.isKeyboardShortcutsOpen(rootState)).toBe(false);
  });

  it('returns false if the query doesnt have "modal" url', () => {
    const rootState = ({navigation: {query: {}}} as any) as AppState;

    expect(selectors.isKeyboardShortcutsOpen(rootState)).toBe(false);
  });
});
