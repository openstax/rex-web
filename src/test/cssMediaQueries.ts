/**
 * The widths a stylesheet's media queries test, for the breakpoint check in
 * src/app/theme.spec.ts. Parsed rather than pattern-matched, so both the colon and
 * range syntaxes are read, `7.4e1em` is 74em, and a `calc()` is one endpoint.
 */

import { stripNoise } from '@openstax/ui-components/theme/cssColors';

export interface MediaWidth {
  /** the feature as written, whitespace-collapsed: `(30em < width < 74em)` */
  query: string;
  /** one endpoint in em (a range gives one per end), or `null` if it cannot be resolved */
  size: number | null;
}

interface Length {
  size: number;
  unit: string;
}

/**
 * A CSS number, including decimals and exponents (`74.5`, `7.4e1`). The decimal form is
 * tried first so `74.5em` is not read as `74` followed by `.5em`. Copied from the
 * ui-components color parser, which does not export it.
 */
const NUMBER = '[+-]?(?:\\d*\\.\\d+|\\d+)(?:e[+-]?\\d+)?';
const LEADING_NUMBER = new RegExp(`^${NUMBER}`, 'i');
const IS_UNIT = /^(?:[a-z]+|%)?$/;

/**
 * `rem` is `em` in a media query (Media Queries 4 §1.3). `px` is not folded in:
 * comparing it to `75em` would mean assuming the user's initial font size.
 */
const EM_EQUIVALENT: {[unit: string]: string} = {em: 'em', rem: 'em'};

/**
 * The text between each `@media` and its `{`. Only this is read, so declarations like
 * `--page-width: 74em` are not mistaken for breakpoints.
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
 * The parenthesised features in a prelude, keeping nested parens whole so that
 * `(min-width: calc(49em + 1em))` is one feature.
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
 * The values in a feature: each number with its unit, and each function call whole.
 * Feature names, operators and colons are skipped.
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
 * Evaluates a `calc()` that adds or subtracts lengths in one unit: `calc(49em + 1em)`
 * is 50em. Anything else (nesting, multiplication, mixed units) is `null`. CSS requires
 * spaces around `+` and `-` in `calc()`, so splitting on them is safe.
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
 * A value as a length, or `null` if it is not a plain length or a `calc()` sum.
 * Declared as a function because it and `calcLength` call each other.
 */
function resolve(value: string): Length | null {
  const text = value.trim();
  const call = /^([a-z][\w-]*)\(([\s\S]*)\)$/i.exec(text);

  if (call) {
    return call[1].toLowerCase() === 'calc' ? calcLength(call[2]) : null;
  }

  const number = LEADING_NUMBER.exec(text);
  if (!number) { return null; }

  const written = text.slice(number[0].length).toLowerCase();
  if (!IS_UNIT.test(written)) { return null; }

  // rem becomes em here so that `calc(74rem + 1em)` adds up
  return {size: parseFloat(number[0]), unit: EM_EQUIVALENT[written] || written};
}

/**
 * Every width endpoint of every media query in a stylesheet, in em. Covers `min-width`,
 * `max-width`, `device-width` and both ends of a range like `(30em < width < 74em)`.
 * Endpoints in other units, such as px, are skipped.
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
