import React from 'react';
import { Provider } from 'react-redux';
import renderer, { act } from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { renderToDom } from '../../../../test/reactutils';
import { receiveFeatureFlags } from '../../../actions';
import { receiveUser } from '../../../auth/actions';
import { User } from '../../../auth/types';
import * as appGuards from '../../../guards';
import MessageProvider from '../../../MessageProvider';
import { locationChange } from '../../../navigation/actions';
import { Store } from '../../../types';
import { assertWindow } from '../../../utils';
import HighlightButton from '../../components/Toolbar/HighlightButton';
import { content } from '../../routes';
import { closeMyHighlights, openMyHighlights } from '../actions';
import { highlightingFeatureFlag } from '../constants';
import { summaryIsLoading } from '../selectors';
import HighlightsPopUp from './HighlightsPopUp';

describe('MyHighlights button and PopUp', () => {
  let dispatch: jest.SpyInstance;
  let store: Store;
  let user: User;

  beforeEach(() => {
    store = createTestStore();
    user = {firstName: 'test', isNotGdprLocation: true, uuid: 'some_uuid'};

    store.dispatch(receiveFeatureFlags([highlightingFeatureFlag]));

    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('opens pop up in "not logged in" state', () => {
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

  it('closes pop up', async() => {
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

  it('opens pop up in "logged in" state', async() => {
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
    const focus = jest.fn();
    const createNodeMock = () => ({focus});

    renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsPopUp />
      </MessageProvider>
    </Provider>, {createNodeMock});

    const isHtmlElement = jest.spyOn(appGuards, 'isHtmlElement');

    isHtmlElement.mockReturnValueOnce(true);

    act(() => { store.dispatch(openMyHighlights()); });

    expect(focus).toHaveBeenCalled();
  });

  it('renders loader', async() => {
    act(() => {
      store.dispatch(receiveUser(user));
    });

    store.dispatch(locationChange({
      action: 'PUSH',
      location: {
        ...assertWindow().location,
        state: {},
      },
      match: {
        params: {
          book: 'newbook',
          page: 'bar',
        },
        route: content,
      },
    }));

    renderToDom(<Provider store={store}>
      <MessageProvider>
        <HighlightsPopUp/>
      </MessageProvider>
    </Provider>);

    act(() => { store.dispatch(openMyHighlights()); });

    expect(summaryIsLoading(store.getState())).toBe(true);
  });

});
