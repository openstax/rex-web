import { createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { combineReducers, createStore } from 'redux';
import { book as archiveBook, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../test/reactutils';
import MessageProvider from '../../MessageProvider';
import createReducer from '../../navigation/reducer';
import { AppState, Store } from '../../types';
import * as actions from '../actions';
import contentReducer, { initialState } from '../reducer';
import { formatBookData } from '../utils';
import ConnectedSidebar, { Sidebar } from './Sidebar';

const book = formatBookData(archiveBook, mockCmsBook);

describe('Sidebar', () => {
  let store: Store;

  beforeEach(() => {
    const state = {
      content: {
        ...initialState,
        book, page,
      },
    } as any as AppState;
    const history = createMemoryHistory();
    const navigation = createReducer(history.location);
    store = createStore(combineReducers({content: contentReducer, navigation}), state);
  });
  it('opens and closes', () => {
    const component = renderer.create(<MessageProvider><Provider store={store}>
      <ConnectedSidebar />
    </Provider></MessageProvider>);

    expect(component.root.findByType(Sidebar).props.isOpen).toBe(null);
    store.dispatch(actions.closeToc());
    expect(component.root.findByType(Sidebar).props.isOpen).toBe(false);
    store.dispatch(actions.openToc());
    expect(component.root.findByType(Sidebar).props.isOpen).toBe(true);
  });

  it('applies mobile scroll lock', () => {
    if (!document) {
      return expect(document).toBeTruthy();
    }

    const render = (isOpen: boolean) => <MessageProvider><Provider store={store}>
      <Sidebar mobileScrollLock='mobilescrolllock' isOpen={isOpen} book={book} page={page} />
    </Provider></MessageProvider>;

    const {root} = renderToDom(render(false));
    expect(document.body.classList.contains('mobilescrolllock')).toBe(false);
    renderToDom(render(true), root);
    expect(document.body.classList.contains('mobilescrolllock')).toBe(true);
  });

  it('resizes on scroll', () => {
    if (!document || !window) {
      expect(window).toBeTruthy();
      return expect(document).toBeTruthy();
    }

    const render = () => <MessageProvider><Provider store={store}>
      <ConnectedSidebar />
    </Provider></MessageProvider>;

    const {node} = renderToDom(render());
    const spy = jest.spyOn(node.style, 'setProperty');

    const event = document.createEvent('UIEvents');
    event.initEvent('scroll', true, false);
    window.dispatchEvent(event);

    expect(spy).toHaveBeenCalledWith('height', expect.anything());
  });
});
