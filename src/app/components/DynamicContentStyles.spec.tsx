import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../test/createTestStore';
import { book } from '../../test/mocks/archiveLoader';
import TestContainer from '../../test/TestContainer';
import { runHooksAsync } from '../../test/utils';
import { setBookStylesUrl } from '../content/actions';
import { State } from '../content/types';
import { locationChange } from '../navigation/actions';
import type { HTMLStyleElement } from '@openstax/types/lib.dom';
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
      .mockImplementation(async(url) => ({
        text: async() => (url as string).includes('file2.css')
          ? '.different { color: green; }'
          : '.cool { color: red; }'
      }) as Response);
  });

  afterEach(() => {
    spyFetch.mockRestore();
    // Clean up any injected style elements
    if (typeof document !== 'undefined') {
      const styleElements = document.head.querySelectorAll('style[data-dynamic-content-styles="true"]');
      styleElements.forEach((el) => el.remove());
    }
    // Clean up global store to prevent test interference
    const globalKey = '__rexDynamicContentStyles__';
    const globalStore: any = globalThis; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (globalKey in globalStore) {
      delete globalStore[globalKey];
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

  it('removes injected style element when component unmounts', async() => {
    store.dispatch(locationChange({ location: { search: 'content-style=file.css' } } as any));

    const component = renderer.create(<TestContainer store={store}>
      <Component book={book} />
    </TestContainer>);

    await runHooksAsync(renderer);

    // Verify style element was injected
    let styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();
    expect(getInjectedStyles()).toContain('.cool { color: red; }');

    // Unmount the component to trigger cleanup
    renderer.act(() => {
      component.unmount();
    });

    // Verify style element was removed by the cleanup function
    styleElement = getInjectedStyleElement();
    expect(styleElement).toBeNull();
  });

  it('removes injected style element when styles change', async() => {
    store.dispatch(setBookStylesUrl('../resources/styles/test-styles.css'));

    renderer.create(<TestContainer store={store}>
      <Component book={book} />
    </TestContainer>);

    await runHooksAsync(renderer);

    // Verify initial style element was injected
    let styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();
    expect(getInjectedStyles()).toContain('.cool { color: blue; }');

    // Change to a different style URL to trigger cleanup and re-injection
    await renderer.act(async() => {
      store.dispatch(locationChange({ location: { search: 'content-style=file.css' } } as any));
    });

    await runHooksAsync(renderer);

    // Verify the old style was cleaned up and new style was injected
    styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();
    const styles = getInjectedStyles();
    expect(styles).toContain('.cool { color: red; }');
    // The old blue style should not be present
    expect(styles).not.toContain('.cool { color: blue; }');
  });

  it('reuses existing global store when multiple components mount', async() => {
    // This test covers line 82: globalKey in globalStore returning true
    store.dispatch(locationChange({ location: { search: 'content-style=file.css' } } as any));

    // Create first component
    const component1 = renderer.create(<TestContainer store={store}>
      <Component book={book} />
    </TestContainer>);

    await runHooksAsync(renderer);

    // Verify style element was injected
    let styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();

    // Create second component - should reuse the same global store and style element
    const component2 = renderer.create(<TestContainer store={store}>
      <Component book={book} />
    </TestContainer>);

    await runHooksAsync(renderer);

    // Should still have only one style element
    const styleElements = document?.head.querySelectorAll('style[data-dynamic-content-styles="true"]');
    expect(styleElements?.length).toBe(1);

    // Unmount first component - style element should remain because second component is still mounted
    renderer.act(() => {
      component1.unmount();
    });

    styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();

    // Unmount second component - now style element should be removed
    renderer.act(() => {
      component2.unmount();
    });

    styleElement = getInjectedStyleElement();
    expect(styleElement).toBeNull();
  });

  it('recreates style element if it was removed from document.head', async() => {
    // This test covers line 89: document.head.contains returning false
    store.dispatch(locationChange({ location: { search: 'content-style=file.css' } } as any));

    renderer.create(<TestContainer store={store}>
      <Component book={book} />
    </TestContainer>);

    await runHooksAsync(renderer);

    // Verify style element was injected
    let styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();

    // Manually remove the style element from document.head (simulating external removal)
    styleElement?.remove();

    // Verify it's gone
    expect(getInjectedStyleElement()).toBeNull();

    // Trigger a re-render by changing styles
    await renderer.act(async() => {
      store.dispatch(locationChange({ location: { search: 'content-style=file2.css' } } as any));
    });

    await runHooksAsync(renderer);

    // Should have recreated the style element
    styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();
    expect(getInjectedStyles()).toContain('.different { color: green; }');
  });

  it('does not remove style element when count is still positive', async() => {
    // This test covers line 103: the condition being false (store.count > 0)
    store.dispatch(locationChange({ location: { search: 'content-style=file.css' } } as any));

    // Create two components
    const component1 = renderer.create(<TestContainer store={store}>
      <Component book={book} />
    </TestContainer>);

    const component2 = renderer.create(<TestContainer store={store}>
      <Component book={book} />
    </TestContainer>);

    await runHooksAsync(renderer);

    // Verify style element exists
    let styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();

    // Unmount first component - count goes from 2 to 1, element should remain
    renderer.act(() => {
      component1.unmount();
    });

    // Style element should still exist because count > 0
    styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();

    // Unmount second component - count goes from 1 to 0, element should be removed
    renderer.act(() => {
      component2.unmount();
    });

    // Now style element should be removed
    styleElement = getInjectedStyleElement();
    expect(styleElement).toBeNull();
  });
});
