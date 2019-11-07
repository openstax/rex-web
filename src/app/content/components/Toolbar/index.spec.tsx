import ReactType from 'react';
import { Provider } from 'react-redux';
import rendererType, { act } from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { receiveUser } from '../../../auth/actions';
import { User } from '../../../auth/types';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { closeMyHighlights, openMyHighlights } from '../../highlights/actions';
import HighlightButton from './HighlightButton';
import HighlightsPopUp from './HighlightsPopUp';

describe('MyHighlights', () => {
  let renderer: typeof rendererType;
  let React: typeof ReactType; // tslint:disable-line:variable-name
  let dispatch: jest.SpyInstance;
  let store: Store;
  let user: User;

  beforeEach(() => {
    React = require('react');
    renderer = require('react-test-renderer');
    store = createTestStore();
    user = {firstName: 'test', isNotGdprLocation: true, uuid: 'some_uuid'};

    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('opens highlights pop up in "not logged in" state', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightButton />
      </MessageProvider>
    </Provider>);

    act(() => {
      /* fire events that update state */
      component.root.findByType('button').props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(openMyHighlights());
  });

  it('closes highlights pop up', async() => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsPopUp />
      </MessageProvider>
    </Provider>);

    act(() => { store.dispatch(openMyHighlights()); });
    act(() => {
      component.root.findByProps({ 'data-testid': 'close-highlights-popup' })
      .props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(closeMyHighlights());
  });

  it('opens highlights pop up in "logged in" state', async() => {
    act(() => {
      store.dispatch(receiveUser(user));
    });

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightButton />
        <HighlightsPopUp />
      </MessageProvider>
    </Provider>);

    act(() => {
      /* fire events that update state */
      component.root.findByType('button').props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(openMyHighlights());
  });
});
