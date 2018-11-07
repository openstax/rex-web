import React from 'react';
import renderer from 'react-test-renderer';
import PageNotFound from './PageNotFound';

describe('PageNotFound', () => {
  it('matches snapshot', () => {
    const tree = renderer
      .create(<PageNotFound />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
