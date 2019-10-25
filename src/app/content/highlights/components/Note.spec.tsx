import React from 'react';
import renderer from 'react-test-renderer';
import { renderToDom } from '../../../../test/reactutils';
import MessageProvider from '../../../MessageProvider';
import Note from './Note';

describe('Note', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<MessageProvider>
      <Note note='' onChange={() => null} />
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('resizes on update when necessary', () => {
    const {node, root} = renderToDom(<MessageProvider>
      <Note note='' onChange={() => null} />
    </MessageProvider>);

    Object.defineProperty(node, 'scrollHeight', { value: 100 });
    Object.defineProperty(node, 'offsetHeight', { value: 50 });

    renderToDom(<MessageProvider>
      <Note note='asdf' onChange={() => null} />
    </MessageProvider>, root);

    expect(node.style.height).toEqual('105px');
  });

  it('doesn\'t resize on update when unneccessary', () => {
    const {node, root} = renderToDom(<MessageProvider>
      <Note note='' onChange={() => null} />
    </MessageProvider>);

    Object.defineProperty(node, 'scrollHeight', { value: 50 });
    Object.defineProperty(node, 'offsetHeight', { value: 50 });

    renderToDom(<MessageProvider>
      <Note note='asdf' onChange={() => null} />
    </MessageProvider>, root);

    expect(node.style.height).toEqual('');
  });
});
