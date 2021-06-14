import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../../test/reactutils';
import TestContainer from '../../../../test/TestContainer';
import { runHooksAsync } from '../../../../test/utils';
import { Store } from '../../../types';
import { assertDocument } from '../../../utils/browser-assertions';
import { receiveBook } from '../../actions';
import { formatBookData } from '../../utils';
import Note from './Note';

const book = formatBookData(archiveBook, mockCmsBook);

describe('Note', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(receiveBook(book));
  });

  it('matches snapshot', async() => {
    const textarea = assertDocument().createElement('textarea');

    const component = renderer.create(<TestContainer store={store}>
      <Note textareaRef={{ current: textarea }} note='' onChange={() => null} onFocus={() => null} />
    </TestContainer>);

    await runHooksAsync();

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('calls onChange', async() => {
    const textareaElement = assertDocument().createElement('textarea');

    const onChange = jest.fn();
    const component = renderer.create(<TestContainer store={store}>
      <Note textareaRef={{ current: textareaElement }} note='' onChange={onChange} onFocus={() => null} />
    </TestContainer>);

    await runHooksAsync();

    const textarea = component.root.findByType('textarea');

    renderer.act(() => {
      textarea.props.onChange({
        target: {
          value: 'asdf',
        },
      });
    });

    expect(onChange).toHaveBeenCalledWith('asdf');
  });

  it('resizes on update when necessary', async() => {
    const textarea = assertDocument().createElement('textarea');

    const component = renderToDom(<TestContainer store={store}>
      <Note textareaRef={{ current: textarea }} note='' onChange={() => null} onFocus={() => null} />
    </TestContainer>);

    await runHooksAsync();

    Object.defineProperty(component.node, 'scrollHeight', { value: 100 });
    Object.defineProperty(component.node, 'offsetHeight', { value: 50 });

    renderToDom(<TestContainer store={store}>
      <Note textareaRef={{ current: textarea }} note='asdf' onChange={() => null} onFocus={() => null} />
    </TestContainer>, component.root);

    expect(component.node.style.height).toEqual('105px');
  });

  it('doesn\'t resize on update when unneccessary', async() => {
    const textarea = assertDocument().createElement('textarea');

    const component = renderToDom(<TestContainer store={store}>
      <Note textareaRef={{ current: textarea }} note='' onChange={() => null} onFocus={() => null} />
    </TestContainer>);

    await runHooksAsync();

    Object.defineProperty(component.node, 'scrollHeight', { value: 50 });
    Object.defineProperty(component.node, 'offsetHeight', { value: 50 });

    renderToDom(<TestContainer store={store}>
      <Note textareaRef={{ current: textarea }} note='asdf' onChange={() => null} onFocus={() => null} />
    </TestContainer>, component.root);

    expect(component.node.style.height).toEqual('');
  });
});
