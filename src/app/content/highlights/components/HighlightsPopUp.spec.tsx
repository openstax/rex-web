import ReactType from 'react';
import { Provider } from 'react-redux';
import rendererType, { act } from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { receiveUser } from '../../../auth/actions';
import { User } from '../../../auth/types';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { assertDocument } from '../../../utils';
import HighlightButton from '../../components/Toolbar/HighlightButton';
import { closeMyHighlights, openMyHighlights } from '../actions';
import HighlightsPopUp from './HighlightsPopUp';

describe('MyHighlights button and PopUp', () => {
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

  it('focus is on pop up content', async() => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsPopUp />
      </MessageProvider>
    </Provider>);

    act(() => { store.dispatch(openMyHighlights()); });

    const active = assertDocument().activeElement;
    const wrapper = component.root.findByProps({'data-testid': 'highlights-popup-wrapper'});

    expect(active).toBe(wrapper);
  });
});
