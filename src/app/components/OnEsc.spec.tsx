import React from 'react';
import { dispatchKeyDownEvent, renderToDom } from '../../test/reactutils';
import TestContainer from '../../test/TestContainer';
import { OnEsc } from './OnEsc';

describe('OnEsc', () => {
  it('doesn\'t throw when it runs without any registered callbacks', () => {
    const { node } = renderToDom(<TestContainer>
      <OnEsc />
    </TestContainer>);

    expect(() => dispatchKeyDownEvent({element: node, key: 'Escape'})).not.toThrow();
  });
});
