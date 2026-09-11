/**
 * The widths a stylesheet's media queries test, for the breakpoint check in
 * src/app/theme.spec.ts.
 *
 * Its own module rather than a regex in the spec because there are two spellings of
 * the same query and both have to be read. `(max-width: 74em)` is the legacy form;
 * `(width <= 74em)` and `(30em < width < 74em)` are the range forms from Media Queries
 * 4, which this repo's stylelint config supports (`media-feature-range-operator-*` in
 * .stylelintrc.css.json). A check that only understood the colon form would let the
 * mistyped breakpoint it exists to catch through in the other syntax.
 *
 * The values are parsed rather than pattern-matched for the same reason. A dimension
 * is a complete CSS `<number>` and its unit, so `7.4e1em` is 74em and not 1em, and a
 * `calc()` is one endpoint rather than a loose collection of the lengths inside it.
 */

import { stripNoise } from './cssColors';

export interface MediaWidth {
  /** the feature as written, whitespace-collapsed: `(30em < width < 74em)` */
  query: string;
  /**
   * One endpoint of it, in em -- a double-ended range yields one entry per endpoint --
   * or `null` when the endpoint could not be resolved to a single length. The spec
   * reports `null` rather than skipping it: an expression this cannot evaluate could
   * be hiding the mistyped breakpoint the check exists to catch.
   */
  size: number | null;
}

interface Length {
  size: number;
  unit: string;
}

/**
 * The CSS `<number>` grammar, the same language src/test/cssColors.ts matches, with
 * the two alternatives swapped. There the pattern is anchored at both ends, so their
 * order cannot matter; here it matches a prefix, and `\d+` first would take the `74`
 * of `74.5em` and leave `.5em` behind as the unit. Longest alternative first.
 *
 * Copied rather than imported because there it is an internal of the engine, and
 * CORE-2737 replaces that file with the published ui-components module, whose exports
 * are the audit surface rather than its grammars.
 *
 * The exponent is the part that matters here. `[\d.]+em` reads `7.4e1em` as the `1em`
 * at its tail -- a valid spelling of 74em read as 1em, so a mistyped breakpoint would
 * sit 1em from nothing and pass.
 */
const NUMBER = '[+-]?(?:\\d*\\.\\d+|\\d+)(?:e[+-]?\\d+)?';
const LEADING_NUMBER = new RegExp(`^${NUMBER}`, 'i');
const IS_UNIT = /^(?:[a-z]+|%)?$/;

/**
 * The text between `@media` and the `{` that opens its block, for every media rule,
 * at any nesting depth. Reading the prelude rather than scanning the whole stylesheet
 * is what keeps declaration values out: `--page-width: 74em` and
 * `var(--width, 74em)` are not breakpoints, and a bare regex for `width` and an `em`
 * would report both.
 *
 * A prelude that never opens a block -- the end of the file, or a stray `;` -- ends
 * there rather than swallowing the rest of the stylesheet.
 */
const preludes = (css: string): string[] => {
  const found: string[] = [];
  const media = /@media\b/gi;
  let match = media.exec(css);

  while (match !== null) {
    const from = match.index + match[0].length;
    const stop = css.slice(from).search(/[{;]/);
    found.push(css.slice(from, stop === -1 ? css.length : from + stop));
    match = media.exec(css);
  }

  return found;
};

/**
 * The parenthesised media features in a prelude. Parens are balanced rather than
 * matched to the next `)`, so a feature whose value is itself a function --
 * `(min-width: calc(49em + 1em))` -- is read as one feature instead of being cut in
 * half at the inner paren.
 */
const features = (prelude: string): string[] => {
  const found: string[] = [];
  let depth = 0;
  let start = 0;

  for (let index = 0; index < prelude.length; index++) {
    if (prelude[index] === '(') {
      if (depth === 0) { start = index + 1; }
      depth++;
    } else if (prelude[index] === ')') {
      if (depth === 1) { found.push(prelude.slice(start, index)); }
      depth = Math.max(0, depth - 1);
    }
  }

  return found;
};

/**
 * The value expressions in a feature: each dimension, and each function call whole.
 *
 * The feature name, the comparison operators and the colon are not values, so a
 * `width`, a `<=` or a `min-` prefix is stepped over rather than read. A function is
 * taken with its arguments so that `calc(49em + 1em)` reaches `resolve` as one
 * endpoint -- reading the lengths inside it separately is what reported that query as
 * 49em and 1em, and then failed it for the 49.
 */
const values = (feature: string): string[] => {
  const found: string[] = [];
  let index = 0;

  while (index < feature.length) {
    const rest = feature.slice(index);

    const call = /^[a-z][\w-]*\(/i.exec(rest);
    if (call) {
      let depth = 1;
      let cursor = index + call[0].length;
      while (cursor < feature.length && depth > 0) {
        if (feature[cursor] === '(') { depth++; }
        if (feature[cursor] === ')') { depth--; }
        cursor++;
      }
      found.push(feature.slice(index, cursor));
      index = cursor;
      continue;
    }

    const number = LEADING_NUMBER.exec(rest);
    if (number) {
      const unit = /^[\w%]*/.exec(rest.slice(number[0].length)) as RegExpExecArray;
      found.push(number[0] + unit[0]);
      index += number[0].length + unit[0].length;
      continue;
    }

    const word = /^[a-z][\w-]*/i.exec(rest);
    index += word ? word[0].length : 1;
  }

  return found;
};

/**
 * A `calc()` body, when it is a sum of lengths that share a unit: `calc(49em + 1em)`
 * is 50em, which is a theme breakpoint exactly and must not be reported.
 *
 * Splitting on the operators is safe because CSS requires whitespace around `+` and
 * `-` inside `calc()`, so neither can be confused with a signed number or an
 * exponent's sign.
 *
 * Anything else is `null`, which the spec reports rather than skips: nested parens,
 * multiplication, a mix of units, or a term that is not a length. Evaluating the
 * general case would be a `calc()` implementation, and guessing at it is how the
 * check would come to pass something it had not understood.
 */
const calcLength = (body: string): Length | null => {
  if (/[()]/.test(body)) { return null; }

  const terms = body.trim().split(/\s+([+-])\s+/);
  let total = resolve(terms[0]);

  for (let index = 1; index < terms.length; index += 2) {
    const term = resolve(terms[index + 1]);

    if (total === null || term === null || term.unit !== total.unit) { return null; }

    total = {
      size: terms[index] === '-' ? total.size - term.size : total.size + term.size,
      unit: total.unit,
    };
  }

  return total;
};

/**
 * A value expression as a length, or `null` when it is not one this understands.
 *
 * The unit has to be an identifier on its own: `74em * 2` leaves `* 2` behind, which
 * is a multiplication rather than a unit, and reading it as an em length would
 * silently accept an endpoint nobody had computed.
 *
 * A hoisted declaration rather than a `const`, because it and `calcLength` call each
 * other: a `calc()` term is itself a value.
 */
function resolve(value: string): Length | null {
  const text = value.trim();
  const call = /^([a-z][\w-]*)\(([\s\S]*)\)$/i.exec(text);

  if (call) {
    return call[1].toLowerCase() === 'calc' ? calcLength(call[2]) : null;
  }

  const number = LEADING_NUMBER.exec(text);
  if (!number) { return null; }

  const unit = text.slice(number[0].length).toLowerCase();

  return IS_UNIT.test(unit) ? {size: parseFloat(number[0]), unit} : null;
}

/**
 * Every width endpoint of every media query in a stylesheet, in source order.
 *
 * A feature counts when it names `width` -- so `min-width`, `max-width`, plain `width`
 * in a range, and the deprecated `device-width` spellings -- and each of its value
 * expressions is an endpoint, which is what gets both ends of `(30em < width < 74em)`.
 *
 * An endpoint that resolves to a length in some other unit is dropped, not reported:
 * the theme's breakpoints are `em`, and `75em` against `1200px` is a comparison this
 * cannot make without assuming a root font size. There are none in `src/**` today.
 */
export const mediaWidths = (css: string): MediaWidth[] => {
  const found: MediaWidth[] = [];

  for (const prelude of preludes(stripNoise(css))) {
    for (const feature of features(prelude)) {
      if (!/\bwidth\b/i.test(feature)) { continue; }

      const query = `(${feature.replace(/\s+/g, ' ').trim()})`;

      for (const value of values(feature)) {
        const length = resolve(value);

        if (length === null) { found.push({query, size: null}); }
        else if (length.unit === 'em') { found.push({query, size: length.size}); }
      }
    }
  }

  return found;
};
