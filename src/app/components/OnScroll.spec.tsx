import React from 'react';
import renderer from 'react-test-renderer';
import OnScroll from './OnScroll';

describe('On scroll', () => {

  it('doesn\'t throw when it has no children', async() => {
    const render = () => { renderer.create( <OnScroll /> ); };

    expect(() => render()).not.toThrow();
  });
});
