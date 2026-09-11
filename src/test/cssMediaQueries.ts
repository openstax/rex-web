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
 */

import { stripNoise } from './cssColors';

export interface MediaWidth {
  /** the feature as written, whitespace-collapsed: `(30em < width < 74em)` */
  query: string;
  /** one endpoint of it, in em. A double-ended range yields one entry per endpoint. */
  size: number;
}

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
 * `(min-width: calc(75em + 1px))` -- is read as one feature instead of being cut in
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
      depth--;
      if (depth === 0) { found.push(prelude.slice(start, index)); }
      depth = Math.max(0, depth);
    }
  }

  return found;
};

/**
 * Every `em` width endpoint in every media query in a stylesheet, in source order.
 *
 * A feature counts when it names `width` -- so `min-width`, `max-width`, plain `width`
 * in a range, and the deprecated `device-width` spellings -- and every `em` length in
 * it is an endpoint, which is what gets both ends of `(30em < width < 74em)`.
 *
 * Lengths in other units are skipped: the theme's breakpoints are `em`, and `75em`
 * against `1200px` is a comparison this cannot make without assuming a root font size.
 * There are none in `src/**` today.
 */
export const mediaWidths = (css: string): MediaWidth[] => {
  const found: MediaWidth[] = [];

  for (const prelude of preludes(stripNoise(css))) {
    for (const feature of features(prelude)) {
      if (!/\bwidth\b/i.test(feature)) { continue; }

      const query = `(${feature.replace(/\s+/g, ' ').trim()})`;

      for (const length of feature.match(/\d*\.?\d+em\b/gi) || []) {
        found.push({query, size: parseFloat(length)});
      }
    }
  }

  return found;
};
