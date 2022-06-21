import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../test/createTestStore';
import { book as archiveBook } from '../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../test/mocks/osWebLoader';
import TestContainer from '../../test/TestContainer';
import { receiveBook } from '../content/actions';
import { formatBookData } from '../content/utils';
import { locationChange } from '../navigation/actions';
import DynamicContentStyles, { WithStyles } from './DynamicContentStyles';

describe('DynamicContentStyles', () => {
  // tslint:disable-next-line: variable-name
  let Component: (props: { disable?: boolean }) => JSX.Element;
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    Component = (props: { disable?: boolean }) => <DynamicContentStyles disable={props.disable}>
      some text
    </DynamicContentStyles>;
  });

  it('fetches styles in content-style param', async() => {
    store.dispatch(locationChange({ location: { search: 'content-style=file.css' } } as any));
    const spyFetch = jest.spyOn(globalThis, 'fetch')
      .mockImplementation(async() => ({ text: async() => '.cool { color: red; }' }) as any);

    const componenet = renderer.create(<TestContainer store={store}>
      <Component />
    </TestContainer>);

    // tslint:disable-next-line: no-empty
    await renderer.act(async() => {});

    expect(spyFetch).toHaveBeenCalledTimes(1);

    const withStyles = componenet.root.findByType(WithStyles);
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
    spyFetch.mockClear();
  });

  it('fetches style in book\'s style_href field', async() => {
    const book = formatBookData(archiveBook, mockCmsBook);
    book.id = '2d941ab9-ac5b-4eb8-b21c-965d36a4f296';
    book.style_href = 'file3.css';
    store.dispatch(receiveBook(book));
    const spyFetch = jest.spyOn(globalThis, 'fetch')
      .mockImplementation(async() => ({ text: async() => '.cool { color: red; }' }) as any);

    const componenet = renderer.create(<TestContainer store={store}>
      <Component />
    </TestContainer>);

    // tslint:disable-next-line: no-empty
    await renderer.act(async() => {});

    expect(spyFetch).toHaveBeenCalledTimes(1);

    const withStyles = componenet.root.findByType(WithStyles);
    expect(withStyles.props.styles).toEqual('.cool { color: red; }');
    expect(spyFetch).toHaveBeenCalledWith('file3.css');

    spyFetch.mockClear();
  });

  it('noops if content-style is not provided', async() => {
    const spyFetch = jest.spyOn(globalThis, 'fetch')
      .mockImplementation(async() => ({ text: async() => '.cool { color: red; }' }) as any);

    renderer.create(<TestContainer store={store}>
      <Component />
    </TestContainer>);

    // tslint:disable-next-line: no-empty
    await renderer.act(() => {});

    expect(spyFetch).not.toHaveBeenCalled();
    spyFetch.mockClear();
  });

  it('noops if disabled is passed', async() => {
    store.dispatch(locationChange({ location: { search: 'content-style=file.css' } } as any));
    const spyFetch = jest.spyOn(globalThis, 'fetch')
      .mockImplementation(async() => ({ text: async() => '.cool { color: red; }' }) as any);

    renderer.create(<TestContainer store={store}>
      <Component disable={true} />
    </TestContainer>);

    // tslint:disable-next-line: no-empty
    await renderer.act(() => {});

    expect(spyFetch).not.toHaveBeenCalled();
    spyFetch.mockClear();
  });
});
