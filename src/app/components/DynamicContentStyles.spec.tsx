import React from 'react';
import ReactDOM from 'react-dom';
import { renderToString } from 'react-dom/server';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import createTestServices from '../../test/createTestServices';
import createTestStore from '../../test/createTestStore';
import { book } from '../../test/mocks/archiveLoader';
import TestContainer from '../../test/TestContainer';
import { runHooksAsync } from '../../test/utils';
import { receiveBook, setBookStylesUrl } from '../content/actions';
import { State } from '../content/types';
import { locationChange } from '../navigation/actions';
import { assertDocument } from '../utils/browser-assertions';
import DynamicContentStyles, {
  DynamicContentStylesProvider,
  escapeStyleSheetText,
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

  it('hoists @keyframes and duplicates them for -webkit-', () => {
    expect(scopeStyles('@keyframes spin { 0% { opacity: 0; } 100% { opacity: 1; } }'))
      .toEqual(
        '@-webkit-keyframes spin{0%{opacity:0;}100%{opacity:1;}}'
        + '@keyframes spin{0%{opacity:0;}100%{opacity:1;}}'
      );
  });

  it('leaves keyframe names alone, so animations declared elsewhere still find them', () => {
    // this is what stylis' `keyframe: false` option buys us: no name namespacing
    expect(scopeStyles('.a { animation: spin 1s; } @keyframes spin { 0% { opacity: 0; } }'))
      .toEqual(
        '[data-dynamic-style="true"] .a{-webkit-animation:spin 1s;animation:spin 1s;}'
        + '@-webkit-keyframes spin{0%{opacity:0;}}@keyframes spin{0%{opacity:0;}}'
      );
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

describe('escapeStyleSheetText', () => {
  // valid css: the sequence is inside a string, so stylis passes it straight through
  const breakout = '.a { content: "</style><img src=x onerror=alert(1)>"; }';

  it('neutralizes closing style tags, which css can legally contain', () => {
    const escaped = escapeStyleSheetText(scopeStyles(breakout));

    expect(escaped).not.toContain('</style');
    // \/ is the css escape for /, so the declaration still means the same thing
    expect(escaped).toContain('<\\/style>');
  });

  it('catches the sequence in any case, since html end tags are case insensitive', () => {
    expect(escapeStyleSheetText('.a { content: "</StYlE >"; }'))
      .toEqual('.a { content: "<\\/StYlE >"; }');
  });

  it('is idempotent, because hydration re-serializes an already escaped stylesheet', () => {
    const once = escapeStyleSheetText(scopeStyles(breakout));

    expect(escapeStyleSheetText(once)).toEqual(once);
  });

  it('leaves css without the sequence untouched', () => {
    expect(escapeStyleSheetText(scopeStyles('.a { color: red; }')))
      .toEqual(scopeStyles('.a { color: red; }'));
  });

  it('stops ScopedGlobalStyle serializing css into escaping markup', () => {
    const container = assertDocument().createElement('div');
    container.innerHTML = renderToString(<ScopedGlobalStyle css={scopeStyles(breakout)} />);

    expect(container.querySelectorAll('style')).toHaveLength(1);
    expect(container.querySelector('img')).toBeNull();
    // the whole payload stayed inside the stylesheet, as css text
    expect(container.querySelector('style')!.textContent).toContain('onerror=alert(1)');
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
    expect(globalStyle.props.css).toEqual(scopeStyles('.cool { color: red; }'));
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
    expect(globalStyle.props.css).toEqual(scopeStyles('.cool { color: blue; }'));
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

describe('the prerendered stylesheet', () => {
  const bookStyles = '.cool { color: blue; }';
  const bookStylesUrl = '../resources/styles/test-styles.css';

  let store: ReturnType<typeof createTestStore>;

  const tree = (services: ReturnType<typeof createTestServices>) => <TestContainer store={store} services={services}>
    <DynamicContentStylesProvider>
      <DynamicContentStyles book={book}>
        some text
      </DynamicContentStyles>
    </DynamicContentStylesProvider>
  </TestContainer>;

  // the browser builds its own archiveLoader, so nothing is cached in it yet
  const withColdCache = () => {
    const services = createTestServices();
    services.archiveLoader.mock.cachedResource.mockReturnValue(undefined as unknown as string);
    return services;
  };

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(receiveBook(book));
  });

  // these tests put things in the real document, and getPrerenderedStyleSheet reads it
  afterEach(() => {
    const document = assertDocument();
    Array.from(document.querySelectorAll('style[data-dynamic-stylesheet], [data-test-container]'))
      .forEach((element) => element.remove());
  });

  it('survives hydration, when the client has not cached the styles yet', () => {
    store.dispatch(setBookStylesUrl(bookStylesUrl));

    const document = assertDocument();
    const container = document.createElement('div');
    container.setAttribute('data-test-container', 'true');
    document.body.appendChild(container);

    // react-redux's useSelector warns about useLayoutEffect on every server render
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    // prerendering, where the archiveLoader does have the styles cached
    container.innerHTML = renderToString(tree(createTestServices()));

    expect(container.querySelector('style[data-dynamic-stylesheet]')!.textContent)
      .toEqual(scopeStyles(bookStyles));

    const clientServices = withColdCache();

    act(() => {
      ReactDOM.hydrate(tree(clientServices), container);
    });

    expect(container.querySelector('style[data-dynamic-stylesheet]')!.textContent)
      .toEqual(scopeStyles(bookStyles));
    expect(consoleError.mock.calls.filter(([message]) => `${message}`.includes('did not match'))).toEqual([]);

    ReactDOM.unmountComponentAtNode(container);
    consoleError.mockRestore();
  });

  it('is dropped when the book has no dynamic styles', async() => {
    const document = assertDocument();
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-dynamic-stylesheet', 'true');
    styleElement.textContent = scopeStyles(bookStyles);
    document.head.appendChild(styleElement);

    // no bookStylesUrl in the store
    const component = renderer.create(tree(withColdCache()));

    await runHooksAsync(renderer);

    expect(component.root.findAllByType(ScopedGlobalStyle)).toEqual([]);
  });

  it('is not looked for outside the browser', () => {
    store.dispatch(setBookStylesUrl(bookStylesUrl));

    const services = withColdCache();
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const documentBack = document;
    delete (global as any).document;

    try {
      expect(renderToString(tree(services))).not.toContain('<style');
    } finally {
      (global as any).document = documentBack;
      consoleError.mockRestore();
    }
  });
});
