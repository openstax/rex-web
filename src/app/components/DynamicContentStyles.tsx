import React from 'react';
import { useSelector } from 'react-redux';
import { bookStylesUrl as bookStylesUrlSelector } from '../content/selectors';
import { State } from '../content/types';
import { useServices } from '../context/Services';
import { query } from '../navigation/selectors';
import { AppServices } from '../types';
import { assertDefined } from '../utils/assertions';

const cacheStyles = new Map<string, string>();

/**
 * Helper function to split selector list safely, respecting commas inside functional pseudos.
 * Splits on commas that are not inside parentheses.
 */
const splitSelectors = (selector: string): string[] => {
  const selectors: string[] = [];
  let current = '';
  let depth = 0;

  for (let i = 0; i < selector.length; i++) {
    const char = selector[i];

    if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      // Only split on commas outside of parentheses
      const trimmed = current.trim();
      if (trimmed) {
        selectors.push(trimmed);
      }
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last selector
  const trimmed = current.trim();
  if (trimmed) {
    selectors.push(trimmed);
  }

  return selectors;
};

/**
 * Transforms CSS by prefixing all selectors with a scope selector.
 * This replicates the behavior of styled-components' stylis preprocessor,
 * which would automatically scope nested CSS rules.
 *
 * Example:
 *   Input:  ".cool { color: blue; }"
 *   Output: "[data-dynamic-style=\"true\"] .cool { color: blue; }"
 *
 * Handles:
 * - Simple selectors: .class, #id, element
 * - Complex selectors: .class1 .class2, .class1, .class2
 * - Functional pseudos with commas: :not(.a, .b), :is(.a, .b), :has(.a, .b)
 * - At-rules: @media, @keyframes, @supports (scope is applied to rules inside)
 * - Declaration at-rules: @font-face, @page, @property (copied as-is)
 * - Vendor-prefixed keyframes: @-webkit-keyframes, @-moz-keyframes
 * - Pseudo-elements and pseudo-classes
 *
 * @internal Exported for testing purposes only
 */
export const scopeCSS = (css: string, scope: string): string => {
  // Remove extra whitespace and normalize
  let result = '';
  let i = 0;

  while (i < css.length) {
    // Skip whitespace
    while (i < css.length && /\s/.test(css[i])) {
      result += css[i];
      i++;
    }

    // Check for at-rules (@media, @keyframes, @supports, etc.)
    if (css[i] === '@') {
      // Find the opening brace or semicolon
      let atRule = '';
      while (i < css.length && css[i] !== '{' && css[i] !== ';') {
        atRule += css[i];
        i++;
      }

      const atRuleNormalized = atRule.trim().toLowerCase();

      // Check if this is a keyframes rule (including vendor prefixes)
      const isKeyframes = atRuleNormalized.startsWith('@keyframes') ||
                          atRuleNormalized.startsWith('@-webkit-keyframes') ||
                          atRuleNormalized.startsWith('@-moz-keyframes') ||
                          atRuleNormalized.startsWith('@-o-keyframes') ||
                          atRuleNormalized.startsWith('@-ms-keyframes');

      // Check if this is a declaration-based at-rule (no selector scoping needed)
      const isDeclarationRule = atRuleNormalized.startsWith('@font-face') ||
                                atRuleNormalized.startsWith('@page') ||
                                atRuleNormalized.startsWith('@property') ||
                                atRuleNormalized.startsWith('@counter-style') ||
                                atRuleNormalized.startsWith('@font-feature-values');

      // Handle keyframes and declaration-based at-rules - don't scope their contents
      if (isKeyframes || isDeclarationRule) {
        result += atRule;
        // Copy the entire block as-is
        if (i < css.length && css[i] === '{') {
          result += css[i]; // opening brace
          i++;
          let braceCount = 1;
          while (i < css.length && braceCount > 0) {
            if (css[i] === '{') { braceCount++; }
            if (css[i] === '}') { braceCount--; }
            result += css[i];
            i++;
          }
        } else if (i < css.length && css[i] === ';') {
          // Some at-rules end with semicolon instead of block
          result += css[i];
          i++;
        }
        continue;
      }

      // For container at-rules (@media, @supports, @container, @layer), recursively scope the contents
      result += atRule;
      if (i < css.length && css[i] === '{') {
        result += css[i]; // opening brace
        i++;

        // Find the matching closing brace
        let braceCount = 1;
        let innerCSS = '';
        while (i < css.length && braceCount > 0) {
          if (css[i] === '{') { braceCount++; }
          if (css[i] === '}') { braceCount--; }

          if (braceCount > 0) {
            innerCSS += css[i];
          } else {
            // Closing brace for the at-rule
            result += scopeCSS(innerCSS, scope); // Recursively scope the inner CSS
            result += css[i]; // closing brace
          }
          i++;
        }
      } else if (i < css.length && css[i] === ';') {
        // Some at-rules end with semicolon
        result += css[i];
        i++;
      }
      continue;
    }

    // Regular rule: extract selector
    let selector = '';
    while (i < css.length && css[i] !== '{') {
      selector += css[i];
      i++;
    }

    if (selector.trim()) {
      // Split multiple selectors safely, respecting commas inside functional pseudos
      const selectors = splitSelectors(selector);
      const scopedSelectors = selectors.map((sel) => `${scope} ${sel}`);
      result += scopedSelectors.join(', ');
    }

    // Copy the rule body (everything between { and })
    if (i < css.length && css[i] === '{') {
      result += css[i]; // opening brace
      i++;
      let braceCount = 1;
      while (i < css.length && braceCount > 0) {
        if (css[i] === '{') { braceCount++; }
        if (css[i] === '}') { braceCount--; }
        result += css[i];
        i++;
      }
    }
  }

  return result;
};

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

interface DynamicContentStylesProps extends React.HTMLAttributes<HTMLDivElement> {
  book: State['book'];
  disable?: boolean;
}

const DynamicContentStyles = React.forwardRef<HTMLElement, DynamicContentStylesProps>((
  { book, children, disable, ...otherProps }: React.PropsWithChildren<DynamicContentStylesProps>,
  ref
) => {
  const [queryStyles, setQueryStyles] = React.useState('');
  const queryParams = useSelector(query);

  // This effect sets the styles for the query param only
  // Book styles use a hook instead, because effects don't work during pre-rendering
  // (and we don't need query styles during pre-rendering)
  React.useEffect(() => {
    if (disable) {
      setQueryStyles('');
      return;
    }

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
    }
  }, [disable, queryParams]);

  const { archiveLoader } = useServices();
  const bookStylesUrl = useSelector(bookStylesUrlSelector);
  const [dataDynamicStyle, styles] = getStyles(disable, queryStyles, book, bookStylesUrl, archiveLoader);

  // Inject dynamic styles into a <style> tag
  // Use useLayoutEffect to inject styles synchronously before paint,
  // preventing FOUC (Flash of Unstyled Content) and matching the
  // synchronous behavior of the original createGlobalStyle approach.
  React.useLayoutEffect(() => {
    if (!styles || typeof document === 'undefined') {
      return;
    }

    const globalKey = '__rexDynamicContentStyles__';
    const globalStore: any = globalThis; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (!(globalKey in globalStore)) {
      globalStore[globalKey] = {
        count: 0,
        element: null as HTMLStyleElement | null,
      };
    }

    const store = globalStore[globalKey];
    store.count += 1;

    if (!store.element || !document.head.contains(store.element)) {
      store.element = document.createElement('style');
      store.element.setAttribute('data-dynamic-content-styles', 'true');
      document.head.appendChild(store.element);
    }

    // Transform the CSS to scope all selectors with [data-dynamic-style="true"]
    // This replicates the behavior of styled-components' stylis preprocessor
    // and ensures compatibility with all browsers (no CSS nesting required)
    const scopedStyles = scopeCSS(styles, '[data-dynamic-style="true"]');
    store.element.textContent = scopedStyles;

    return () => {
      store.count -= 1;
      if (store.count <= 0 && store.element) {
        store.element.remove();
        store.element = null;
      }
    };
  }, [styles]);

  return <div data-dynamic-style={dataDynamicStyle} {...otherProps} ref={ref}>
    {children}
  </div>;
});

export default DynamicContentStyles;
