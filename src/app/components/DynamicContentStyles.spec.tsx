import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../test/createTestStore';
import { book } from '../../test/mocks/archiveLoader';
import TestContainer from '../../test/TestContainer';
import { runHooksAsync } from '../../test/utils';
import { receiveBook, setBookStylesUrl } from '../content/actions';
import { State } from '../content/types';
import { locationChange } from '../navigation/actions';
import DynamicContentStyles, {
  DynamicContentStylesProvider,
  ScopedGlobalStyle,
  scopeStyles,
} from './DynamicContentStyles';

describe('scopeStyles', () => {
  it('scopes plain selectors under the dynamic style attribute', () => {
    expect(scopeStyles('.cool { color: red; }'))
      .toEqual('[data-dynamic-style="true"] .cool{color:red;}');
  });

  it('scopes each selector in a list', () => {
    expect(scopeStyles('.a, .b { color: red; }'))
      .toEqual('[data-dynamic-style="true"] .a,[data-dynamic-style="true"] .b{color:red;}');
  });

  it('hoists conditional at-rules and scopes the selectors inside them', () => {
    expect(scopeStyles('@media print { .a { display: none; } }'))
      .toEqual('@media print{[data-dynamic-style="true"] .a{display:none;}}');
    expect(scopeStyles('@supports (display: grid) { .a { display: grid; } }'))
      .toEqual('@supports (display:grid){[data-dynamic-style="true"] .a{display:grid;}}');
  });

  it('hoists non-selector at-rules without scoping them', () => {
    expect(scopeStyles("@font-face { font-family: 'B'; }"))
      .toEqual("@font-face{font-family:'B';}");
    expect(scopeStyles('@page { margin: 1cm; }'))
      .toEqual('@page{margin:1cm;}');
  });

  it('lifts @import to the front, where css requires it', () => {
    expect(scopeStyles(".a { color: red; } @import url('other.css');"))
      .toEqual("@import url('other.css');[data-dynamic-style=\"true\"] .a{color:red;}");
  });

  it('adds vendor prefixes', () => {
    expect(scopeStyles('.a { display: flex; }'))
      .toContain('-webkit-flex');
  });
});

describe('DynamicContentStyles', () => {
  let store: ReturnType<typeof createTestStore>;
  let spyFetch: ReturnType<typeof jest.spyOn>;

  const renderApp = (props: { book: State['book'], disable?: boolean }) => renderer.create(
    <TestContainer store={store}>
      <DynamicContentStylesProvider>
        <DynamicContentStyles book={props.book} disable={props.disable}>
          some text
        </DynamicContentStyles>
      </DynamicContentStylesProvider>
    </TestContainer>
  );

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(receiveBook(book));
    spyFetch = jest.spyOn(globalThis, 'fetch')
      .mockImplementation(async() => ({ text: async() => '.cool { color: red; }' }) as any);
  });

  afterEach(() => {
    spyFetch.mockClear();
  });

  it('fetches styles in content-style param and sets styles and data-dynamic-style', async() => {
    store.dispatch(locationChange({ location: { search: 'content-style=file.css' } } as any));

    const component = renderApp({ book });

    await runHooksAsync(renderer);

    expect(spyFetch).toHaveBeenCalledTimes(1);
    expect(spyFetch).toHaveBeenCalledWith('file.css');

    const globalStyle = component.root.findByType(ScopedGlobalStyle);
    expect(globalStyle.props.styles).toEqual('.cool { color: red; }');
    expect(component.root.findByProps({ 'data-dynamic-style': true })).toBeTruthy();

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

    const component = renderApp({ book });

    await runHooksAsync(renderer);

    const globalStyle = component.root.findByType(ScopedGlobalStyle);
    expect(globalStyle.props.styles).toEqual('.cool { color: blue; }');
  });

  it('does not set styles but sets data-dynamic-style if bookStylesUrl is not cached', async() => {
    store.dispatch(setBookStylesUrl('../resources/styles/uncached-styles.css'));

    const component = renderApp({ book });

    await runHooksAsync(renderer);

    expect(component.root.findAllByType(ScopedGlobalStyle)).toEqual([]);
    // still true so the hydrated markup matches the prerendered markup
    expect(component.root.findByProps({ 'data-dynamic-style': true })).toBeTruthy();
  });

  it('does not set data-dynamic-style if disable is passed', async() => {
    store.dispatch(setBookStylesUrl('../resources/styles/test-styles.css'));

    const component = renderApp({ book, disable: true });

    await runHooksAsync(renderer);

    expect(component.root.findByProps({ 'data-dynamic-style': false })).toBeTruthy();
  });

  it('does not set styles and data-dynamic-style if store and query params not set', async() => {
    const component = renderApp({ book });

    await runHooksAsync(renderer);

    expect(component.root.findAllByType(ScopedGlobalStyle)).toEqual([]);
    expect(component.root.findByProps({ 'data-dynamic-style': false })).toBeTruthy();
  });
});
