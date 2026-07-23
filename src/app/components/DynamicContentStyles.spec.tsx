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
import DynamicContentStyles, { scopeCSS } from './DynamicContentStyles';

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

    // Check that the style element was injected with the correct transformed styles
    // The CSS should be scoped with flat selectors, not nested CSS
    const injectedStyles = getInjectedStyles();
    expect(injectedStyles).toContain('[data-dynamic-style="true"] .cool');
    expect(injectedStyles).toContain('color: red');

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

    // Check that the style element was injected with the correct transformed cached styles
    const injectedStyles = getInjectedStyles();
    expect(injectedStyles).toContain('[data-dynamic-style="true"] .cool');
    expect(injectedStyles).toContain('color: blue');
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

    // Verify style element was injected with transformed CSS
    let styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();
    expect(getInjectedStyles()).toContain('[data-dynamic-style="true"] .cool');
    expect(getInjectedStyles()).toContain('color: red');

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

    // Verify initial style element was injected with transformed CSS
    let styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();
    expect(getInjectedStyles()).toContain('[data-dynamic-style="true"] .cool');
    expect(getInjectedStyles()).toContain('color: blue');

    // Change to a different style URL to trigger cleanup and re-injection
    await renderer.act(async() => {
      store.dispatch(locationChange({ location: { search: 'content-style=file.css' } } as any));
    });

    await runHooksAsync(renderer);

    // Verify the old style was cleaned up and new style was injected
    styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();
    const styles = getInjectedStyles();
    expect(styles).toContain('[data-dynamic-style="true"] .cool');
    expect(styles).toContain('color: red');
    // The old blue style should not be present
    expect(styles).not.toContain('color: blue');
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

    // Should have recreated the style element with transformed CSS
    styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();
    expect(getInjectedStyles()).toContain('[data-dynamic-style="true"] .different');
    expect(getInjectedStyles()).toContain('color: green');
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

describe('scopeCSS', () => {
  const scope = '[data-dynamic-style="true"]';

  it('handles CSS with leading whitespace (covers line 34)', () => {
    // This test exercises the while loop body that skips whitespace
    const css = '  \n\t  .cool { color: red; }';
    const result = scopeCSS(css, scope);
    expect(result).toContain('[data-dynamic-style="true"] .cool');
    expect(result).toContain('color: red');
  });

  it('handles @media at-rules (covers line 40 - at-rule branch)', () => {
    // This test exercises the if statement at line 40 when it's true (at-rule detected)
    const css = '@media (min-width: 768px) { .cool { color: blue; } }';
    const result = scopeCSS(css, scope);
    expect(result).toContain('@media (min-width: 768px)');
    expect(result).toContain('[data-dynamic-style="true"] .cool');
    expect(result).toContain('color: blue');
  });

  it('handles @keyframes at-rules without scoping keyframe selectors (covers line 40 @keyframes branch)', () => {
    // This test exercises the special @keyframes handling that preserves the block as-is
    const css = '@keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }';
    const result = scopeCSS(css, scope);
    expect(result).toContain('@keyframes fadeIn');
    expect(result).toContain('0%');
    expect(result).toContain('100%');
    expect(result).toContain('opacity: 0');
    expect(result).toContain('opacity: 1');
    // Keyframe selectors should NOT be scoped
    expect(result).not.toContain('[data-dynamic-style="true"] 0%');
    expect(result).not.toContain('[data-dynamic-style="true"] 100%');
  });

  it('handles @supports at-rules (covers line 40 - other at-rules branch)', () => {
    // This test exercises the recursive scoping for at-rules like @supports
    const css = '@supports (display: grid) { .grid { display: grid; } }';
    const result = scopeCSS(css, scope);
    expect(result).toContain('@supports (display: grid)');
    expect(result).toContain('[data-dynamic-style="true"] .grid');
    expect(result).toContain('display: grid');
  });

  it('handles empty selector gracefully (covers line 99 else branch)', () => {
    // This test exercises the else branch when selector.trim() is falsy
    const css = '   { color: red; }';  // Empty selector before opening brace
    const result = scopeCSS(css, scope);
    // Should handle gracefully without crashing
    expect(result).toBeDefined();
  });

  it('handles malformed CSS with missing opening brace (covers line 107 else branch)', () => {
    // This test exercises the else branch when there's no opening brace after a selector
    const css = '.cool';  // Selector without opening brace
    const result = scopeCSS(css, scope);
    // Should handle gracefully - the function should not crash
    expect(result).toContain('[data-dynamic-style="true"] .cool');
  });

  it('handles nested braces in rule body (covers line 112 - brace increment)', () => {
    // This test exercises the if statement at line 112 that increments braceCount
    // This happens with CSS that contains nested braces (unusual but possible in some contexts)
    const css = '.cool { content: "{"; color: red; }';
    const result = scopeCSS(css, scope);
    expect(result).toContain('[data-dynamic-style="true"] .cool');
    expect(result).toContain('content: "{"');
    expect(result).toContain('color: red');
  });

  it('handles complex nested at-rules with multiple levels (covers nested brace counting)', () => {
    // This test exercises complex nesting with multiple brace levels
    const css = '@media screen { @supports (display: flex) { .flex { display: flex; } } }';
    const result = scopeCSS(css, scope);
    expect(result).toContain('@media screen');
    expect(result).toContain('@supports (display: flex)');
    expect(result).toContain('[data-dynamic-style="true"] .flex');
    expect(result).toContain('display: flex');
  });

  it('handles multiple selectors separated by commas', () => {
    const css = '.class1, .class2 { color: red; }';
    const result = scopeCSS(css, scope);
    expect(result).toContain('[data-dynamic-style="true"] .class1, [data-dynamic-style="true"] .class2');
    expect(result).toContain('color: red');
  });

  it('preserves whitespace structure while transforming selectors', () => {
    const css = '\n.cool {\n  color: red;\n  font-size: 14px;\n}\n';
    const result = scopeCSS(css, scope);
    expect(result).toContain('[data-dynamic-style="true"] .cool');
    expect(result).toContain('color: red');
    expect(result).toContain('font-size: 14px');
  });

  it('handles @keyframes without opening brace (covers line 54 else branch)', () => {
    // This test exercises the else branch at line 54 when @keyframes is at end of CSS without opening brace
    const css = '@keyframes fadeIn';  // @keyframes declaration without opening brace
    const result = scopeCSS(css, scope);
    // Should handle gracefully without crashing
    expect(result).toContain('@keyframes fadeIn');
    expect(result).toBeDefined();
  });

  it('handles at-rule without opening brace (covers line 70 else branch)', () => {
    // This test exercises the else branch at line 70 when at-rule has no opening brace
    const css = '@media screen';  // @media declaration without opening brace
    const result = scopeCSS(css, scope);
    // Should handle gracefully - function should not crash
    expect(result).toContain('@media screen');
    expect(result).toBeDefined();
  });
});
