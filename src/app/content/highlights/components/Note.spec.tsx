import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import { renderToDom } from '../../../../test/reactutils';
import Note from './Note';

describe('Note', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<Note />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('resizes on update when necessary', () => {
    const {node} = renderToDom(<Note />);

    Object.defineProperty(node, 'scrollHeight', { value: 100 });
    Object.defineProperty(node, 'offsetHeight', { value: 50 });

    ReactTestUtils.Simulate.change(node);

    expect(node.style.height).toEqual('105px');
  });

  it('doesn\'t resize on update when unneccessary', () => {
    const {node} = renderToDom(<Note />);

    Object.defineProperty(node, 'scrollHeight', { value: 50 });
    Object.defineProperty(node, 'offsetHeight', { value: 50 });

    ReactTestUtils.Simulate.change(node);

    expect(node.style.height).toEqual('');
  });
});
