import { HTMLStyleElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useSelector } from 'react-redux';
import Stylis from 'stylis';
import { book as bookSelector, bookStylesUrl as bookStylesUrlSelector } from '../content/selectors';
import { State } from '../content/types';
import { useServices } from '../context/Services';
import { query } from '../navigation/selectors';
import { AppServices } from '../types';
import { assertDefined } from '../utils/assertions';

/*
 * Scopes book CSS under `scopeSelector` with the same stylis options styled-components v4
 * used, so the output matches what createGlobalStyle produced.
 */
const stylis = new Stylis({
  cascade: true,
  compress: false,
  global: false,
  keyframe: false,
  prefix: true,
  semicolon: false,
});

const scopeSelector = '[data-dynamic-style="true"]';

// Strips `//` line comments, which styled-components removed before calling stylis.
const JS_COMMENT_REGEX = /^\s*\/\/.*$/gm;

export const scopeStyles = (styles: string) =>
  stylis('', `${scopeSelector} { ${styles.replace(JS_COMMENT_REGEX, '')} }`);

/*
 * Turns `</style` into `<\/style` so CSS cannot close the <style> element early when
 * serialized as markup. `\/` is a CSS escape for `/`, so the meaning is unchanged.
 */
export const escapeStyleSheetText = (css: string) => css.replace(/<(\/style)/gi, '<\\$1');

// must match the attribute ScopedGlobalStyle renders
const styleSheetSelector = 'style[data-dynamic-stylesheet]';

/*
 * Hydration does not dispatch receiveBook, so the archiveLoader cache is empty on first
 * render. Reading the stylesheet from the prerendered markup keeps hydration from
 * discarding it.
 */
const getPrerenderedStyleSheet = () => {
  if (typeof document === 'undefined') {
    return '';
  }

  return document.querySelector(styleSheetSelector)?.textContent || '';
};

/*
 * Only the prerender serializes the stylesheet as markup, so only it needs escaping.
 * The browser writes stylesheets with textContent, so the html passed to react is
 * frozen at mount and every later update goes through the effect.
 */
const serializeFirstRender = (css: string) => escapeStyleSheetText(
  typeof document === 'undefined' ? css : getPrerenderedStyleSheet()
);

export const ScopedGlobalStyle = ({ css }: { css: string }) => {
  const ref = React.useRef<HTMLStyleElement>(null);
  const [initialHtml] = React.useState(() => serializeFirstRender(css));

  React.useEffect(() => {
    const styleSheet = ref.current;

    // already equal when hydrating, so hydration doesn't rewrite the adopted sheet
    if (styleSheet && styleSheet.textContent !== css) {
      styleSheet.textContent = css;
    }
  }, [css]);

  return <style
    ref={ref}
    data-dynamic-stylesheet='true'
    dangerouslySetInnerHTML={{ __html: initialHtml }}
  />;
};

const cacheStyles = new Map<string, string>();

const getStyles = (
  disable: boolean | undefined,
  queryStyles: string,
  book: State['book'],
  bookStylesUrl: string | null,
  archiveLoader: AppServices['archiveLoader']
): [boolean, string] => {
  if (!disable) {
    if (queryStyles) {
      // Query param styles have higher priority and override book styles
      return [true, queryStyles];
    } else if (book && bookStylesUrl) {
      // The dynamicStyles hook already checked that the book config had dynamicStyles enabled
      // Returning true with a blank string can happen when hydrating
      // We set data-dynamic-style to true in this case so the HTML remains the same
      return [true, archiveLoader.forBook(book).resource(bookStylesUrl).cached() || ''];
    }
  }

  return [false, ''];
};

// Held at the root so list items like ContentExcerpt do not each fetch and render the stylesheet.
const QueryStylesContext = React.createContext<string>('');

const useQueryStyles = () => {
  const [queryStyles, setQueryStyles] = React.useState('');
  const queryParams = useSelector(query);

  // This effect sets the styles for the query param only
  // Book styles use a hook instead, because effects don't work during pre-rendering
  // (and we don't need query styles during pre-rendering)
  React.useEffect(() => {
    const cssfileUrl = queryParams?.['content-style'];
    if (cssfileUrl && typeof cssfileUrl === 'string') {
      if (cacheStyles.has(cssfileUrl)) {
        setQueryStyles(assertDefined(cacheStyles.get(cssfileUrl), `we've just checked for this`));
      } else {
        fetch(cssfileUrl)
          .then((res) => res.text())
          .then((data) => {
            cacheStyles.set(cssfileUrl, data);
            setQueryStyles(data);
          });
      }
    } else {
      setQueryStyles('');
    }
  }, [queryParams]);

  return queryStyles;
};

// Renders the single scoped stylesheet and provides the query-param styles.
export const DynamicContentStylesProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const queryStyles = useQueryStyles();
  const book = useSelector(bookSelector);
  const bookStylesUrl = useSelector(bookStylesUrlSelector);
  const { archiveLoader } = useServices();
  const [prerenderedCss] = React.useState(getPrerenderedStyleSheet);
  const [hasDynamicStyle, styles] = getStyles(false, queryStyles, book, bookStylesUrl, archiveLoader);
  // Styles are blank while hydrating or loading; keep the page's current stylesheet until then
  const css = React.useMemo(() => styles ? scopeStyles(styles) : '', [styles]) || prerenderedCss;

  return <QueryStylesContext.Provider value={queryStyles}>
    {hasDynamicStyle && css ? <ScopedGlobalStyle css={css} /> : null}
    {children}
  </QueryStylesContext.Provider>;
};

interface DynamicContentStylesProps extends React.HTMLAttributes<HTMLDivElement> {
  book: State['book'];
  disable?: boolean;
}

const DynamicContentStyles = React.forwardRef<HTMLElement, DynamicContentStylesProps>((
  { book, children, disable, ...otherProps }: React.PropsWithChildren<DynamicContentStylesProps>,
  ref
) => {
  const queryStyles = React.useContext(QueryStylesContext);
  const { archiveLoader } = useServices();
  const bookStylesUrl = useSelector(bookStylesUrlSelector);
  // Only the flag is used; DynamicContentStylesProvider renders the stylesheet. It stays true for a
  // not-yet-cached resource so the hydrated HTML matches the prerendered HTML.
  const [dataDynamicStyle] = getStyles(disable, queryStyles, book, bookStylesUrl, archiveLoader);

  return <div data-dynamic-style={dataDynamicStyle} {...otherProps} ref={ref}>
    {children}
  </div>;
});

export default DynamicContentStyles;
