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
import DynamicContentStyles, { wrapWithNesting } from './DynamicContentStyles';

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
    return styleElement?.textContent ?? '';
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

    // Check that the style element was injected with CSS nesting
    const injectedStyles = getInjectedStyles();
    expect(injectedStyles).toContain('[data-dynamic-style="true"]');
    expect(injectedStyles).toContain('.cool');
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

    // Check that the style element was injected with CSS nesting for cached styles
    const injectedStyles = getInjectedStyles();
    expect(injectedStyles).toContain('[data-dynamic-style="true"]');
    expect(injectedStyles).toContain('.cool');
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

    // Verify style element was injected with CSS nesting
    let styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();
    const styles1 = getInjectedStyles();
    expect(styles1).toContain('[data-dynamic-style="true"]');
    expect(styles1).toContain('.cool');
    expect(styles1).toContain('color: red');

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

    // Verify initial style element was injected with CSS nesting
    let styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();
    const styles2 = getInjectedStyles();
    expect(styles2).toContain('[data-dynamic-style="true"]');
    expect(styles2).toContain('.cool');
    expect(styles2).toContain('color: blue');

    // Change to a different style URL to trigger cleanup and re-injection
    await renderer.act(async() => {
      store.dispatch(locationChange({ location: { search: 'content-style=file.css' } } as any));
    });

    await runHooksAsync(renderer);

    // Verify the old style was cleaned up and new style was injected
    styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();
    const styles3 = getInjectedStyles();
    expect(styles3).toContain('[data-dynamic-style="true"]');
    expect(styles3).toContain('.cool');
    expect(styles3).toContain('color: red');
    // The old blue style should not be present
    expect(styles3).not.toContain('color: blue');
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

    // Should have recreated the style element with CSS nesting
    styleElement = getInjectedStyleElement();
    expect(styleElement).not.toBeNull();
    const styles4 = getInjectedStyles();
    expect(styles4).toContain('[data-dynamic-style="true"]');
    expect(styles4).toContain('.different');
    expect(styles4).toContain('color: green');
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

describe('wrapWithNesting', () => {
  const scope = '[data-dynamic-style="true"]';

  it('wraps simple CSS in nesting block', () => {
    const css = '.cool { color: red; }';
    const result = wrapWithNesting(css, scope);
    expect(result).toBe('[data-dynamic-style="true"] {\n.cool { color: red; }\n}');
  });

  it('wraps CSS with multiple rules in nesting block', () => {
    const css = '.class1 { color: red; }\n.class2 { color: blue; }';
    const result = wrapWithNesting(css, scope);
    expect(result).toContain('[data-dynamic-style="true"] {');
    expect(result).toContain('.class1 { color: red; }');
    expect(result).toContain('.class2 { color: blue; }');
    expect(result).toContain('}');
  });

  it('wraps CSS with @media rules in nesting block (container at-rule)', () => {
    const css = '@media (min-width: 768px) { .cool { color: blue; } }';
    const result = wrapWithNesting(css, scope);
    expect(result).toContain('[data-dynamic-style="true"] {');
    expect(result).toContain('@media (min-width: 768px)');
    expect(result).toContain('.cool { color: blue; }');
    // @media should be nested, not hoisted
    expect(result.indexOf('@media')).toBeGreaterThan(result.indexOf('[data-dynamic-style="true"]'));
  });

  it('hoists @keyframes rules to the top (top-level at-rule)', () => {
    const css = '.cool { color: blue; } @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }';
    const result = wrapWithNesting(css, scope);
    expect(result).toContain('@keyframes fadeIn');
    expect(result).toContain('0%');
    expect(result).toContain('100%');
    expect(result).toContain('[data-dynamic-style="true"] {');
    expect(result).toContain('.cool { color: blue; }');
    // @keyframes should come before the scoped block
    expect(result.indexOf('@keyframes')).toBeLessThan(result.indexOf('[data-dynamic-style="true"]'));
  });

  it('hoists vendor-prefixed @keyframes rules', () => {
    const css = '.cool { color: blue; } @-webkit-keyframes fadeIn { 0% { opacity: 0; } }';
    const result = wrapWithNesting(css, scope);
    expect(result).toContain('@-webkit-keyframes fadeIn');
    expect(result).toContain('[data-dynamic-style="true"] {');
    // Vendor-prefixed @keyframes should come before the scoped block
    expect(result.indexOf('@-webkit-keyframes')).toBeLessThan(result.indexOf('[data-dynamic-style="true"]'));
  });

  it('hoists @font-face rules to the top', () => {
    const css = '.text { font-family: Custom; } @font-face { font-family: "Custom"; src: url("font.woff2"); }';
    const result = wrapWithNesting(css, scope);
    expect(result).toContain('@font-face');
    expect(result).toContain('font-family: "Custom"');
    expect(result).toContain('[data-dynamic-style="true"] {');
    expect(result).toContain('.text { font-family: Custom; }');
    // @font-face should come before the scoped block
    expect(result.indexOf('@font-face')).toBeLessThan(result.indexOf('[data-dynamic-style="true"]'));
  });

  it('hoists @page rules to the top', () => {
    const css = '.print { color: black; } @page { margin: 1in; }';
    const result = wrapWithNesting(css, scope);
    expect(result).toContain('@page');
    expect(result).toContain('margin: 1in');
    expect(result).toContain('[data-dynamic-style="true"] {');
    // @page should come before the scoped block
    expect(result.indexOf('@page')).toBeLessThan(result.indexOf('[data-dynamic-style="true"]'));
  });

  it('hoists @property rules to the top', () => {
    const css = '.custom { --color: red; } @property --my-color { syntax: "<color>"; inherits: false; }';
    const result = wrapWithNesting(css, scope);
    expect(result).toContain('@property --my-color');
    expect(result).toContain('syntax: "<color>"');
    expect(result).toContain('[data-dynamic-style="true"] {');
    // @property should come before the scoped block
    expect(result.indexOf('@property')).toBeLessThan(result.indexOf('[data-dynamic-style="true"]'));
  });

  it('hoists multiple top-level at-rules in order', () => {
    const css = '@keyframes fadeIn { 0% { opacity: 0; } } .cool { animation: fadeIn; } @font-face { font-family: "Custom"; }';
    const result = wrapWithNesting(css, scope);
    expect(result).toContain('@keyframes fadeIn');
    expect(result).toContain('@font-face');
    expect(result).toContain('[data-dynamic-style="true"] {');
    expect(result).toContain('.cool { animation: fadeIn; }');
    // Both at-rules should come before the scoped block
    expect(result.indexOf('@keyframes')).toBeLessThan(result.indexOf('[data-dynamic-style="true"]'));
    expect(result.indexOf('@font-face')).toBeLessThan(result.indexOf('[data-dynamic-style="true"]'));
  });

  it('preserves functional pseudos with commas in nesting block', () => {
    const css = '.button:not(.disabled, .loading) { color: blue; }';
    const result = wrapWithNesting(css, scope);
    expect(result).toContain('[data-dynamic-style="true"] {');
    expect(result).toContain('.button:not(.disabled, .loading)');
    expect(result).toContain('color: blue');
  });

  it('preserves multiple selectors separated by commas in nesting block', () => {
    const css = '.class1, .class2 { color: red; }';
    const result = wrapWithNesting(css, scope);
    expect(result).toContain('[data-dynamic-style="true"] {');
    expect(result).toContain('.class1, .class2 { color: red; }');
  });

  it('handles mixed hoisted and nested at-rules', () => {
    const css = '@keyframes slideIn { from { left: 0; } } @media (min-width: 768px) { .cool { color: blue; } } .text { color: red; }';
    const result = wrapWithNesting(css, scope);
    expect(result).toContain('@keyframes slideIn');
    expect(result).toContain('@media (min-width: 768px)');
    expect(result).toContain('[data-dynamic-style="true"] {');
    // @keyframes should be hoisted before scope
    expect(result.indexOf('@keyframes')).toBeLessThan(result.indexOf('[data-dynamic-style="true"]'));
    // @media should be nested inside scope
    expect(result.indexOf('@media')).toBeGreaterThan(result.indexOf('[data-dynamic-style="true"]'));
  });

  it('handles empty CSS', () => {
    const css = '';
    const result = wrapWithNesting(css, scope);
    expect(result).toBe('');
  });

  it('handles CSS with only hoisted at-rules', () => {
    const css = '@keyframes fadeIn { 0% { opacity: 0; } }';
    const result = wrapWithNesting(css, scope);
    expect(result).toContain('@keyframes fadeIn');
    expect(result).not.toContain('[data-dynamic-style="true"]');
  });
});
