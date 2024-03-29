import ReactType from 'react';
import rendererType from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import TestContainer from '../../../test/TestContainer';
import { Store } from '../../types';
import { dismissNotification, retiredBookRedirect } from '../actions';
import RetiredBookRedirect from './RetiredBookRedirect';

describe('RetiredBookRedirect', () => {
  let renderer: typeof rendererType;
  let React: typeof ReactType; // tslint:disable-line:variable-name
  let dispatch: jest.SpyInstance;
  let store: Store;

  beforeEach(() => {
    React = require('react');
    renderer = require('react-test-renderer');
    store = createTestStore();

    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('dismisses notification', () => {
    const notification = retiredBookRedirect();

    const component = renderer.create(<TestContainer store={store}>
      <RetiredBookRedirect notification={notification} />
    </TestContainer>);

    component.root.findByType('button').props.onClick();

    expect(dispatch).toHaveBeenCalledWith(dismissNotification(notification));
  });
});
