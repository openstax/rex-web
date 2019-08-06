import React from 'react';
import renderer from 'react-test-renderer';
import MessageProvider from '../../MessageProvider';
import ErrorCard from './ErrorCard';

describe('ErrorCard', () => {

  it('matches snapshot', () => {
    const error = new Error('unknown error');

    const tree = renderer
      .create(<MessageProvider><ErrorCard error={error} /></MessageProvider>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
