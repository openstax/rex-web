import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import MessageProvider from '../../MessageProvider';
import ErrorModal from './ErrorModal';

describe('ErrorModal', () => {

  it('matches snapshot', () => {

    const error = new Error('unknown error');
    const store = createTestStore({ errors: { error } });

    const tree = renderer
      .create(<MessageProvider><Provider store={store}><ErrorModal /></Provider></MessageProvider>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
