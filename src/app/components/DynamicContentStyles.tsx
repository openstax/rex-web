import React from 'react';
import type { HTMLStyleElement } from '@openstax/types/lib.dom';
import { useSelector } from 'react-redux';
import { bookStylesUrl as bookStylesUrlSelector } from '../content/selectors';
import { State } from '../content/types';
import { useServices } from '../context/Services';
import { query } from '../navigation/selectors';
import { AppServices } from '../types';
import { assertDefined } from '../utils/assertions';

const cacheStyles = new Map<string, string>();

/**
 * Helper function to skip over strings and comments when parsing CSS.
 * This prevents characters inside strings/comments from being mistaken for structural CSS syntax.
 *
 * @param css - The CSS string being parsed
 * @param i - Current position in the CSS string
 * @returns New position after skipping string or comment, or original position if not at string/comment start
 */
const skipStringsAndComments = (css: string, i: number): number => {
  // Handle strings (both single and double quoted)
  if (css[i] === '"' || css[i] === "'") {
    const quote = css[i];
    i++;
    while (i < css.length) {
      if (css[i] === '\\') {
        // Skip escaped character (e.g., \" or \\)
        i += 2;
      } else if (css[i] === quote) {
        // Found closing quote
        return i + 1;
      } else {
        i++;
      }
    }
    return i; // Unclosed string - return end position
  }

  // Handle block comments /* ... */
  if (css[i] === '/' && i + 1 < css.length && css[i + 1] === '*') {
    i += 2;
    while (i < css.length - 1) {
      if (css[i] === '*' && css[i + 1] === '/') {
        // Found end of comment
        return i + 2;
      }
      i++;
    }
    return i; // Unclosed comment - return end position
  }

  // Not at a string or comment start
  return i;
};

/**
 * Wraps CSS content in a nesting selector to scope all styles to elements with a specific attribute.
 * Uses CSS nesting (supported in all modern browsers) to automatically scope all selectors.
 *
 * Top-level at-rules (@keyframes, @font-face, @page, @property, etc.) are hoisted outside the
 * nesting block because they must be at the root of the stylesheet to work correctly.
 *
 * Example:
 *   Input:  ".cool { color: blue; } @keyframes fadeIn { 0% { opacity: 0; } }"
 *   Output: "@keyframes fadeIn { 0% { opacity: 0; } }\n[data-dynamic-style=\"true\"] { .cool { color: blue; } }"
 *
 * CSS nesting automatically handles:
 * - Simple selectors: .class, #id, element
 * - Complex selectors: .class1 .class2, .class1, .class2
 * - Functional pseudos: :not(), :is(), :has()
 * - Container at-rules: @media, @supports, @container, @layer (nested inside scope)
 * - Pseudo-elements and pseudo-classes
 *
 * Handles edge cases:
 * - Strings with special characters: @import url("https://example.com/a;b.css");
 * - Comments with braces: /* } */ /*
 * - Escaped quotes in strings: content: "\"";
 *
 * @internal Exported for testing purposes only
 */
export const wrapWithNesting = (css: string, scope: string): string => {
  // At-rules that must be hoisted to the root of the stylesheet
  // These cannot be nested inside other rules
  const topLevelAtRules = [
    '@keyframes',
    '@-webkit-keyframes',
    '@-moz-keyframes',
    '@-o-keyframes',
    '@-ms-keyframes',
    '@font-face',
    '@page',
    '@property',
    '@counter-style',
    '@font-feature-values',
    '@import',
    '@charset',
    '@namespace',
  ];

  const hoistedRules: string[] = [];
  const nestedRules: string[] = [];

  let i = 0;
  while (i < css.length) {
    // Skip whitespace
    const wsStart = i;
    while (i < css.length && /\s/.test(css[i])) {
      i++;
    }
    const whitespace = css.substring(wsStart, i);

    // Check for at-rules
    if (css[i] === '@') {
      const atRuleStart = i;

      // Extract the at-rule name
      let atRuleName = '@';
      i++;
      while (i < css.length && /[a-z-]/i.test(css[i])) {
        atRuleName += css[i];
        i++;
      }

      // Check if this is a top-level at-rule that needs hoisting
      const shouldHoist = topLevelAtRules.some(rule =>
        atRuleName.toLowerCase().startsWith(rule.toLowerCase())
      );

      // Find the end of the at-rule (semicolon or closing brace)
      let braceDepth = 0;
      let atRuleEnd = i;

      // Skip to the opening brace or semicolon, avoiding strings and comments
      while (atRuleEnd < css.length && css[atRuleEnd] !== '{' && css[atRuleEnd] !== ';') {
        const newPos = skipStringsAndComments(css, atRuleEnd);
        if (newPos !== atRuleEnd) {
          // Skipped over a string or comment
          atRuleEnd = newPos;
        } else {
          atRuleEnd++;
        }
      }

      if (atRuleEnd < css.length && css[atRuleEnd] === '{') {
        // Has a block - find the matching closing brace, avoiding strings and comments
        braceDepth = 1;
        atRuleEnd++;
        while (atRuleEnd < css.length && braceDepth > 0) {
          const newPos = skipStringsAndComments(css, atRuleEnd);
          if (newPos !== atRuleEnd) {
            // Skipped over a string or comment
            atRuleEnd = newPos;
          } else {
            if (css[atRuleEnd] === '{') { braceDepth++; }
            if (css[atRuleEnd] === '}') { braceDepth--; }
            atRuleEnd++;
          }
        }
      } else if (atRuleEnd < css.length && css[atRuleEnd] === ';') {
        // Ends with semicolon
        atRuleEnd++;
      }

      const fullAtRule = css.substring(atRuleStart, atRuleEnd);

      if (shouldHoist) {
        hoistedRules.push(fullAtRule);
      } else {
        nestedRules.push(whitespace + fullAtRule);
      }

      i = atRuleEnd;
      continue;
    }

    // Regular rule - find the end
    const ruleStart = i;
    let braceDepth = 0;
    let foundOpenBrace = false;

    // Skip to opening brace, avoiding strings and comments
    while (i < css.length && css[i] !== '{') {
      const newPos = skipStringsAndComments(css, i);
      if (newPos !== i) {
        // Skipped over a string or comment
        i = newPos;
      } else {
        i++;
      }
    }

    if (i < css.length && css[i] === '{') {
      foundOpenBrace = true;
      braceDepth = 1;
      i++;

      while (i < css.length && braceDepth > 0) {
        const newPos = skipStringsAndComments(css, i);
        if (newPos !== i) {
          // Skipped over a string or comment
          i = newPos;
        } else {
          if (css[i] === '{') { braceDepth++; }
          if (css[i] === '}') { braceDepth--; }
          i++;
        }
      }
    }

    if (foundOpenBrace) {
      nestedRules.push(whitespace + css.substring(ruleStart, i));
    } else if (ruleStart < i) {
      // Content without braces (shouldn't normally happen, but preserve it)
      nestedRules.push(whitespace + css.substring(ruleStart, i));
    }
  }

  // Combine hoisted rules at the top, then the scoped nested rules
  const result: string[] = [];

  if (hoistedRules.length > 0) {
    result.push(hoistedRules.join('\n'));
  }

  const nested = nestedRules.join('').trim();
  if (nested) {
    result.push(`${scope} {\n${nested}\n}`);
  }

  return result.join('\n');
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
  // Use an isomorphic layout effect to avoid SSR warnings during prerendering,
  // while still injecting synchronously before paint in the browser.
  /* istanbul ignore next */
  const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

  useIsomorphicLayoutEffect(() => {
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

    // Wrap the CSS in a nesting block to scope all styles to [data-dynamic-style="true"]
    // This uses native CSS nesting, which is supported in all modern browsers
    const scopedStyles = wrapWithNesting(styles, '[data-dynamic-style="true"]');
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
