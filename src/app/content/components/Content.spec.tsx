import React from 'react';
import renderer from 'react-test-renderer';
import Content from './Content';

describe('content', () => {
  it('matches snapshot', () => {
    const tree = renderer
      .create(<Content />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
