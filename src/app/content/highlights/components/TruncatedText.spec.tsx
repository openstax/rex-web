import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import TestContainer from '../../../../test/TestContainer';
import { runHooksAsync } from '../../../../test/utils';
import { Store } from '../../../types';
import { receiveBook } from '../../actions';
import { formatBookData } from '../../utils';
import TruncatedText from './TruncatedText';

const book = formatBookData(archiveBook, mockCmsBook);

describe('TruncatedText', () => {
  let store: Store;
  const bookState = formatBookData(book, mockCmsBook);

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(receiveBook(bookState));
  });

  it('matches snapshot', async() => {
    const component = renderer.create(<TestContainer store={store}>
      <TruncatedText text='asdf' isActive={false} onChange={() => null} />
    </TestContainer>);

    await runHooksAsync();

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when focused', async() => {
    store.dispatch(receiveBook(bookState));

    const component = renderer.create(<TestContainer store={store}>
      <TruncatedText text='asdf' isActive={true} onChange={() => null} />
    </TestContainer>);

    await runHooksAsync();

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('shows link', async() => {
    const createNodeMock = () => ({
      offsetHeight: 50,
      scrollHeight: 100,
    });

    const component = renderer.create(<TestContainer store={store}>
      <TruncatedText text='asdf' isActive={true} onChange={() => null} />
    </TestContainer>, {createNodeMock});

    await runHooksAsync();

    component.update(<TestContainer store={store}>
      <TruncatedText text='asdf' isActive={true} onChange={() => null} />
    </TestContainer>);

    expect(() => component.root.findByType('span')).not.toThrow();
  });

  it('calls onChange when state changes', async() => {
    const onChange = jest.fn();

    renderer.create(<TestContainer store={store}>
      <TruncatedText text='asdf' isActive={false} onChange={onChange} />
    </TestContainer>);

    await runHooksAsync();

    renderer.create(<TestContainer store={store}>
      <TruncatedText text='asdf' isActive={true} onChange={onChange} />
    </TestContainer>);

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
