import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../test/createTestStore';
import { book } from '../../test/mocks/archiveLoader';
import TestContainer from '../../test/TestContainer';
import { runHooksAsync } from '../../test/utils';
import { setBookStylesUrl } from '../content/actions';
import { State } from '../content/types';
import { locationChange } from '../navigation/actions';
import DynamicContentStyles from './DynamicContentStyles';

describe('DynamicContentStyles', () => {
  let Component: (props: { book: State['book'], disable?: boolean }) => JSX.Element;
  let store: ReturnType<typeof createTestStore>;
  let spyFetch: ReturnType<typeof jest.spyOn>;

  // Helper function to get the injected style element
  const getInjectedStyleElement = (): HTMLStyleElement | null => {
    if (typeof document === 'undefined') {
      return null;
    }
    return document.head.querySelector('style[data-dynamic-content-styles="true"]');
  };

  // Helper function to check if styles contain expected content
  const getInjectedStyles = (): string => {
    const styleElement = getInjectedStyleElement();
    // tslint:disable-next-line:no-any
    return (styleElement as any)?.textContent || '';
  };

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
    // Clean up any injected style elements
    if (typeof document !== 'undefined') {
      const styleElements = document.head.querySelectorAll('style[data-dynamic-content-styles="true"]');
      styleElements.forEach((el) => el.remove());
    }
  });

  it('fetches styles in content-style param and sets styles and data-dynamic-style', async() => {
    store.dispatch(locationChange({ location: { search: 'content-style=file.css' } } as any));

    renderer.create(<TestContainer store={store}>
      <Component book={book} />
    </TestContainer>);

    await runHooksAsync(renderer);

    expect(spyFetch).toHaveBeenCalledTimes(1);
    expect(spyFetch).toHaveBeenCalledWith('file.css');

    // Check that the style element was injected with the correct styles
    const injectedStyles = getInjectedStyles();
    expect(injectedStyles).toContain('.cool { color: red; }');
    expect(injectedStyles).toContain('[data-dynamic-style="true"]');

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

  it('sets styles and data-dynamic-style if bookStylesUrl is in the store and styles are cached', async() => {
    store.dispatch(setBookStylesUrl('../resources/styles/test-styles.css'));

    renderer.create(<TestContainer store={store}>
      <Component book={book} />
    </TestContainer>);

    await runHooksAsync(renderer);

    // Check that the style element was injected with the correct cached styles
    const injectedStyles = getInjectedStyles();
    expect(injectedStyles).toContain('.cool { color: blue; }');
    expect(injectedStyles).toContain('[data-dynamic-style="true"]');
  });

  it('does not set styles but sets data-dynamic-style if bookStylesUrl is not cached', async() => {
    store.dispatch(setBookStylesUrl('../resources/styles/uncached-styles.css'));

    renderer.create(<TestContainer store={store}>
      <Component book={book} />
    </TestContainer>);

    await runHooksAsync(renderer);

    // When styles are not cached, no style element should be injected
    const styleElement = getInjectedStyleElement();
    expect(styleElement).toBeNull();
  });

  it('does not set styles and data-dynamic-style if disable is passed', async() => {
    store.dispatch(setBookStylesUrl('../resources/styles/test-styles.css'));

    renderer.create(<TestContainer store={store}>
      <Component book={book} disable={true} />
    </TestContainer>);

    await runHooksAsync(renderer);

    // When disabled, no style element should be injected
    const styleElement = getInjectedStyleElement();
    expect(styleElement).toBeNull();
  });

  it('does not set styles and data-dynamic-style if store and query params not set', async() => {
    renderer.create(<TestContainer store={store}>
      <Component book={book} />
    </TestContainer>);

    await runHooksAsync(renderer);

    // When no styles are available, no style element should be injected
    const styleElement = getInjectedStyleElement();
    expect(styleElement).toBeNull();
  });
});
