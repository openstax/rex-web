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
 * Book CSS is fetched at runtime, so it cannot live in a static .css file.
 * It used to be scoped with styled-components' createGlobalStyle; stylis is the
 * CSS preprocessor createGlobalStyle used internally, so calling it directly
 * produces byte-identical output while dropping the styled-components
 * dependency. These are the exact options styled-components v4 configured its
 * stylis instance with.
 *
 * stylis does four separate jobs here, which is why it is worth keeping rather
 * than hand-rolling a string prefix:
 *   1. scopes every selector under [data-dynamic-style="true"]
 *   2. hoists @media/@supports out, keeping the scope on the inner selectors
 *   3. lifts @font-face/@keyframes/@page out unscoped, and @import to the front
 *   4. adds vendor prefixes
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

/*
 * styled-components stripped `//` line comments before handing a template
 * literal to stylis. Book CSS should never contain them (they aren't valid
 * CSS), but this keeps the output identical to what shipped before.
 */
const JS_COMMENT_REGEX = /^\s*\/\/.*$/gm;

export const scopeStyles = (styles: string) =>
  stylis('', `${scopeSelector} { ${styles.replace(JS_COMMENT_REGEX, '')} }`);

export const ScopedGlobalStyle = ({ css }: { css: string }) => (
  <style data-dynamic-stylesheet='true' dangerouslySetInnerHTML={{ __html: css }} />
);

// must match the attribute ScopedGlobalStyle renders
const styleSheetSelector = 'style[data-dynamic-stylesheet]';

/*
 * Prerendered pages already carry this stylesheet in their markup, but the browser
 * starts with an empty archiveLoader cache: hydration doesn't dispatch receiveBook,
 * so the dynamicStyles hook never runs and `cached()` returns nothing. Reading the
 * stylesheet back out of the document keeps the first client render byte-identical
 * to the prerendered markup, instead of hydration tearing the book's only copy of
 * its CSS out of the page.
 *
 * This is also what createGlobalStyle did: styled-components rehydrated the
 * prerendered stylesheet and left it alone until non-empty styles replaced it.
 */
const getPrerenderedStyleSheet = () => {
  if (typeof document === 'undefined') {
    return '';
  }

  return document.querySelector(styleSheetSelector)?.textContent || '';
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

/*
 * Styles fetched from the content-style query param. Held at the root rather
 * than per instance: the stylesheet is global, and ContentExcerpt renders in
 * lists, so a per-instance fetch and a per-instance <style> would duplicate
 * both the request and the whole book stylesheet once per list item.
 */
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

/*
 * Renders the single scoped stylesheet for the whole app and makes the
 * query-param styles available to every DynamicContentStyles instance.
 */
export const DynamicContentStylesProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const queryStyles = useQueryStyles();
  const book = useSelector(bookSelector);
  const bookStylesUrl = useSelector(bookStylesUrlSelector);
  const { archiveLoader } = useServices();
  // Read once on mount, before anything has had a chance to replace it
  const [prerenderedCss] = React.useState(getPrerenderedStyleSheet);
  const [hasDynamicStyle, styles] = getStyles(false, queryStyles, book, bookStylesUrl, archiveLoader);
  // Styles are blank while hydrating, and while a newly selected book's stylesheet
  // is still loading; keep serving whatever the page already has until it resolves
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
  // Only the flag is used here; the stylesheet itself is rendered once by
  // DynamicContentStylesProvider. The flag still has to be computed per
  // instance because `disable` is a prop, and because it stays true for a
  // not-yet-cached resource so the hydrated HTML matches the prerendered HTML.
  const [dataDynamicStyle] = getStyles(disable, queryStyles, book, bookStylesUrl, archiveLoader);

  return <div data-dynamic-style={dataDynamicStyle} {...otherProps} ref={ref}>
    {children}
  </div>;
});

export default DynamicContentStyles;
