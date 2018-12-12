import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { combineReducers, createStore } from 'redux';
import { AppState } from '../../types';
import reducer, { initialState } from '../reducer';
import ConnectedSidebar, { Sidebar } from './Sidebar';

const book = {
  id: 'booklongid',
  shortId: 'book',
  title: 'book title',
  tree: {
    contents: [
      {
        id: 'pagelongid',
        shortId: 'page',
        title: 'page title',
      },
      {
        id: 'pagelongid2',
        shortId: 'page2',
        title: 'page title2',
      },
    ],
    id: 'booklongid',
    shortId: 'book',
    title: 'book title',
  },
  version: '0',
};
const page = {
  id: 'pagelongid',
  shortId: 'page',
  title: 'page title',
  version: '0',
};

describe('Sidebar', () => {
  it('opens and closes', () => {
    const state = {
      content: {
        ...initialState,
        book, page,
      },
    } as any as AppState;
    const store = createStore(combineReducers({content: reducer}), state);

    const component = renderer.create(<Provider store={store}>
      <ConnectedSidebar />
    </Provider>);

    expect(component.root.findByType(Sidebar).props.isOpen).toBe(true);
    component.root.findByType('button').props.onClick();
    expect(component.root.findByType(Sidebar).props.isOpen).toBe(false);
    component.root.findByType('button').props.onClick();
    expect(component.root.findByType(Sidebar).props.isOpen).toBe(true);
  });
});
