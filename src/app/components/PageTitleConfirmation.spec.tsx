import React from 'react';
import { renderToDom } from '../../test/reactutils';
// import { act } from 'react-dom/test-utils';
import { initialState } from '../reducer';
import createTestStore from '../../test/createTestStore';
import PageTitleConfirmation from './PageTitleConfirmation';
import TestContainer from '../../test/TestContainer';
import { setHead } from '../head/actions';

describe('PageTitleConfirmation', () => {
  it('skips blank, skips first non-blank, announces subsequent', async() => {
    const state = {
      ...initialState,
    };

    state.head.title = 'initial';
    const store = createTestStore(state);

    store.dispatch(setHead({...initialState.head, title: ''}));
    const component = renderToDom(
      <TestContainer store={store}>
        <PageTitleConfirmation className='any' />
      </TestContainer>
    );

    expect(component.node.textContent).toBe('');
    store.dispatch(setHead({...initialState.head, title: 'initial'}));
    expect(component.node.textContent).toBe('');
    store.dispatch(setHead({...initialState.head, title: 'something'}));
    expect(component.node.textContent).toBe('Loaded page something');
    component.unmount();
  });
});
