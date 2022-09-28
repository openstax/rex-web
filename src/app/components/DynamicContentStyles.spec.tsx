import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../test/createTestStore';
import { book as archiveBook } from '../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../test/mocks/osWebLoader';
import TestContainer from '../../test/TestContainer';
import { runHooksAsync } from '../../test/utils';
import { receiveBook } from '../content/actions';
import { State } from '../content/types';
import { formatBookData } from '../content/utils';
import { locationChange } from '../navigation/actions';
import DynamicContentStyles, { WithStyles } from './DynamicContentStyles';

describe('DynamicContentStyles', () => {
  // tslint:disable-next-line: variable-name
  let Component: (props: { book: State['book'], disable?: boolean }) => JSX.Element;
  let store: ReturnType<typeof createTestStore>;
  let spyFetch: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    store = createTestStore();
    Component = (
      props: { book: State['book'], disable?: boolean }
    ) => <DynamicContentStyles book={props.book} disable={props.disable}>
      some text
    </DynamicContentStyles>;
    spyFetch = jest.spyOn(globalThis, 'fetch')
      .mockImplementation(async() => ({ text: async() => '.cool { color: red; }' }) as any);
  });

  afterEach(() => {
    spyFetch.mockClear();
  });

  it('fetches styles in content-style param', async() => {
    store.dispatch(locationChange({ location: { search: 'content-style=file.css' } } as any));

    const component = renderer.create(<TestContainer store={store}>
      <Component book={archiveBook} />
    </TestContainer>);

    await runHooksAsync(renderer);

    expect(spyFetch).toHaveBeenCalledTimes(1);

    const withStyles = component.root.findByType(WithStyles);
    expect(withStyles.props.styles).toEqual('.cool { color: red; }');
    expect(spyFetch).toHaveBeenCalledWith('file.css');

    await renderer.act(async() => {
      store.dispatch(locationChange({ location: { search: 'content-style=file2.css' } } as any));
    });

    expect(spyFetch).toHaveBeenCalledTimes(2);

    await renderer.act(async() => {
      store.dispatch(locationChange({ location: { search: 'content-style=file.css' } } as any));
    });

    // Don't call fetch again for the same url
    expect(spyFetch).toHaveBeenCalledTimes(2);
  });

  it('fetches style in book\'s style_href field', async() => {
    const book = formatBookData(archiveBook, mockCmsBook);
    book.style_href = '../resources/styles/file3.css';
    book.loadOptions.booksConfig.books[book.id].dynamicStyles = true;
    store.dispatch(receiveBook(book));

    const component = renderer.create(<TestContainer store={store}>
      <Component book={book} />
    </TestContainer>);

    await runHooksAsync(renderer);

    expect(spyFetch).toHaveBeenCalledTimes(1);

    const withStyles = component.root.findByType(WithStyles);
    expect(withStyles.props.styles).toEqual('.cool { color: red; }');
    expect(spyFetch).toHaveBeenCalledWith('/apps/archive/codeversion/resources/styles/file3.css');
  });

  it('also works with absolute style URLs', async() => {
    const book = formatBookData(archiveBook, mockCmsBook);
    book.style_href = 'https://openstax.org/apps/archive/codeversion/file3.css';
    book.loadOptions.booksConfig.books[book.id].dynamicStyles = true;
    store.dispatch(receiveBook(book));

    const component = renderer.create(<TestContainer store={store}>
      <Component book={book} />
    </TestContainer>);

    await runHooksAsync(renderer);

    expect(spyFetch).toHaveBeenCalledTimes(1);

    const withStyles = component.root.findByType(WithStyles);
    expect(withStyles.props.styles).toEqual('.cool { color: red; }');
    expect(spyFetch).toHaveBeenCalledWith(
      'https://openstax.org/apps/archive/codeversion/file3.css'
    );
  });

  it('noops if content-style is not provided', async() => {
    renderer.create(<TestContainer store={store}>
      <Component book={archiveBook} />
    </TestContainer>);

    // tslint:disable-next-line: no-empty
    await renderer.act(async() => {});

    expect(spyFetch).not.toHaveBeenCalled();
  });

  it('noops if disable is passed', async() => {
    store.dispatch(locationChange({ location: { search: 'content-style=file.css' } } as any));

    renderer.create(<TestContainer store={store}>
      <Component book={archiveBook} disable={true} />
    </TestContainer>);

    // tslint:disable-next-line: no-empty
    await renderer.act(async() => {});

    expect(spyFetch).not.toHaveBeenCalled();
  });
});
