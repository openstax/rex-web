/**
 * color auditing for plain-CSS stylesheets, used by src/app/theme.spec.ts.
 *
 * This parses declarations rather than grepping for `#hex`, because a grep misses
 * `rgba()`, `hsl()`, named colors in shorthands and colors in gradient stops —
 * all of which can silently duplicate or diverge from a theme value.
 *
 * Lives under src/test/ because it is test infrastructure rather than app code, so
 * it is outside jest's `collectCoverageFrom`. It has its own spec regardless: without
 * one, "CI enforces the palette" would be an assertion rather than a tested guarantee.
 */

import fs from 'fs';
import path from 'path';
import { themeTokens } from '../app/themeCss';

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FoundColor {
  /** the literal exactly as written, e.g. `rgba(0, 0, 0, 0.2)` */
  literal: string;
  /** resolved channels, or null when this syntax cannot be resolved statically */
  rgba: Rgba | null;
}

/** A declaration, with enough of its surroundings to identify it again. */
export interface Declaration {
  /**
   * The selectors and at-rule preludes the declaration sits inside, outermost first,
   * whitespace-collapsed: `@media (max-width: 75em) .book-banner .title`. Used as the
   * stable half of a color occurrence's identity in the baseline.
   */
  context: string;
  /** lower-cased property name, e.g. `background-color` or `--book-banner-height` */
  property: string;
  /** everything to the right of the `:` */
  value: string;
}

/** A color literal together with the declaration it was written in. */
export interface StylesheetColor extends FoundColor {
  context: string;
  property: string;
}

/** https://www.w3.org/TR/css-color-4/#named-colors */
const NAMED_COLORS: {[name: string]: string} = {
  aliceblue: '#f0f8ff', antiquewhite: '#faebd7', aqua: '#00ffff', aquamarine: '#7fffd4',
  azure: '#f0ffff', beige: '#f5f5dc', bisque: '#ffe4c4', black: '#000000',
  blanchedalmond: '#ffebcd', blue: '#0000ff', blueviolet: '#8a2be2', brown: '#a52a2a',
  burlywood: '#deb887', cadetblue: '#5f9ea0', chartreuse: '#7fff00', chocolate: '#d2691e',
  coral: '#ff7f50', cornflowerblue: '#6495ed', cornsilk: '#fff8dc', crimson: '#dc143c',
  cyan: '#00ffff', darkblue: '#00008b', darkcyan: '#008b8b', darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9', darkgreen: '#006400', darkgrey: '#a9a9a9', darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b', darkolivegreen: '#556b2f', darkorange: '#ff8c00',
  darkorchid: '#9932cc', darkred: '#8b0000', darksalmon: '#e9967a',
  darkseagreen: '#8fbc8f', darkslateblue: '#483d8b', darkslategray: '#2f4f4f',
  darkslategrey: '#2f4f4f', darkturquoise: '#00ced1', darkviolet: '#9400d3',
  deeppink: '#ff1493', deepskyblue: '#00bfff', dimgray: '#696969', dimgrey: '#696969',
  dodgerblue: '#1e90ff', firebrick: '#b22222', floralwhite: '#fffaf0',
  forestgreen: '#228b22', fuchsia: '#ff00ff', gainsboro: '#dcdcdc',
  ghostwhite: '#f8f8ff', gold: '#ffd700', goldenrod: '#daa520', gray: '#808080',
  green: '#008000', greenyellow: '#adff2f', grey: '#808080', honeydew: '#f0fff0',
  hotpink: '#ff69b4', indianred: '#cd5c5c', indigo: '#4b0082', ivory: '#fffff0',
  khaki: '#f0e68c', lavender: '#e6e6fa', lavenderblush: '#fff0f5', lawngreen: '#7cfc00',
  lemonchiffon: '#fffacd', lightblue: '#add8e6', lightcoral: '#f08080',
  lightcyan: '#e0ffff', lightgoldenrodyellow: '#fafad2', lightgray: '#d3d3d3',
  lightgreen: '#90ee90', lightgrey: '#d3d3d3', lightpink: '#ffb6c1',
  lightsalmon: '#ffa07a', lightseagreen: '#20b2aa', lightskyblue: '#87cefa',
  lightslategray: '#778899', lightslategrey: '#778899', lightsteelblue: '#b0c4de',
  lightyellow: '#ffffe0', lime: '#00ff00', limegreen: '#32cd32', linen: '#faf0e6',
  magenta: '#ff00ff', maroon: '#800000', mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd', mediumorchid: '#ba55d3', mediumpurple: '#9370db',
  mediumseagreen: '#3cb371', mediumslateblue: '#7b68ee', mediumspringgreen: '#00fa9a',
  mediumturquoise: '#48d1cc', mediumvioletred: '#c71585', midnightblue: '#191970',
  mintcream: '#f5fffa', mistyrose: '#ffe4e1', moccasin: '#ffe4b5',
  navajowhite: '#ffdead', navy: '#000080', oldlace: '#fdf5e6', olive: '#808000',
  olivedrab: '#6b8e23', orange: '#ffa500', orangered: '#ff4500', orchid: '#da70d6',
  palegoldenrod: '#eee8aa', palegreen: '#98fb98', paleturquoise: '#afeeee',
  palevioletred: '#db7093', papayawhip: '#ffefd5', peachpuff: '#ffdab9',
  peru: '#cd853f', pink: '#ffc0cb', plum: '#dda0dd', powderblue: '#b0e0e6',
  purple: '#800080', rebeccapurple: '#663399', red: '#ff0000', rosybrown: '#bc8f8f',
  royalblue: '#4169e1', saddlebrown: '#8b4513', salmon: '#fa8072',
  sandybrown: '#f4a460', seagreen: '#2e8b57', seashell: '#fff5ee', sienna: '#a0522d',
  silver: '#c0c0c0', skyblue: '#87ceeb', slateblue: '#6a5acd', slategray: '#708090',
  slategrey: '#708090', snow: '#fffafa', springgreen: '#00ff7f', steelblue: '#4682b4',
  tan: '#d2b48c', teal: '#008080', thistle: '#d8bfd8', tomato: '#ff6347',
  turquoise: '#40e0d0', violet: '#ee82ee', wheat: '#f5deb3', white: '#ffffff',
  whitesmoke: '#f5f5f5', yellow: '#ffff00', yellowgreen: '#9acd32',
};

/**
 * color functions are terminal — we try to resolve them and flag them.
 * Anything else that happens to *contain* a color (`var`, `color-mix`, the
 * gradients) is descended into instead.
 */
const COLOR_FUNCTIONS = [
  'rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color',
];

/**
 * Keywords that are color-valued but carry no fixed channels, so there is nothing
 * to compare against the theme. They are never flagged.
 */
const COLOR_KEYWORDS = ['transparent', 'currentcolor', 'inherit', 'initial', 'unset', 'revert', 'none'];

/**
 * Blanks the parts of a stylesheet that can hold color-shaped text without meaning a
 * color: comments, string contents and `url()` payloads.
 *
 * Blanked to spaces rather than deleted, so the result is the same length as the input
 * and every character keeps its original index. `declarations` relies on that: it finds
 * structure in the blanked text and then slices the corresponding span out of a second,
 * differently-blanked copy.
 *
 * `keepStrings` is what that second copy is for. A string is noise inside a declaration
 * value — `content: "#fff"` is not a color — but it is *meaning* inside a selector:
 * `[data-loading="true"]` and `[data-loading="false"]` are different rules, and blanking
 * both to `[data-loading=""]` would make them one declaration as far as the baseline is
 * concerned, so a literal could move between them without the ratchet noticing.
 */
const blankNoise = (css: string, keepStrings: boolean): string => {
  const pad = (length: number) => ' '.repeat(Math.max(0, length));
  let out = '';
  let index = 0;

  while (index < css.length) {
    const rest = css.slice(index);

    if (rest.startsWith('/*')) {
      const end = css.indexOf('*/', index + 2);
      const stop = end === -1 ? css.length : end + 2;
      out += pad(stop - index);
      index = stop;
      continue;
    }

    const quote = css[index];
    if (quote === '"' || quote === '\'') {
      let cursor = index + 1;
      while (cursor < css.length && css[cursor] !== quote) {
        cursor += css[cursor] === '\\' ? 2 : 1;
      }
      const stop = Math.min(cursor + 1, css.length);
      // blanked whole, quotes included: nothing downstream needs the quotes, and
      // keeping them would have to handle an unterminated string running off the end.
      out += keepStrings ? css.slice(index, stop) : pad(stop - index);
      index = stop;
      continue;
    }

    const url = /^url\(/i.exec(rest);
    if (url) {
      const open = index + url[0].length;
      let depth = 1;
      let cursor = open;
      while (cursor < css.length && depth > 0) {
        if (css[cursor] === '(') { depth++; }
        if (css[cursor] === ')') { depth--; }
        cursor++;
      }
      // the parens themselves are structure -- `declarations` balances them -- so only
      // the payload between them is blanked.
      const closed = depth === 0;
      const payloadEnd = closed ? cursor - 1 : cursor;
      out += css.slice(index, open) + pad(payloadEnd - open) + (closed ? ')' : '');
      index = cursor;
      continue;
    }

    out += css[index];
    index++;
  }

  return out;
};

/** Noise blanked for reading declaration values: strings go too. */
export const stripNoise = (css: string): string => blankNoise(css, false);

/**
 * Pulls declarations out of a stylesheet at any nesting depth, so `@media` blocks are
 * covered. Selectors and at-rule preludes end at a `{` and become the declaration's
 * `context` rather than being read as declarations themselves, which is what keeps
 * `a:hover` and `@keyframes` percentages out of the color scan.
 *
 * The property name is kept as well as the value. Two things need it: a bare
 * identifier is only a color in a property that takes one (`animation-name: red` is
 * an animation), and the baseline needs a way to tell two occurrences of the same
 * literal in the same file apart.
 *
 * Two blanked copies of the source are walked in step. Structure is read from `values`,
 * where strings are gone, so a `;` or `{` inside one cannot split a declaration. The
 * `context` is sliced out of `selectors`, where string contents survive, so that
 * `[data-loading="true"]` and `[data-loading="false"]` stay distinguishable. Both are
 * the same length as the input, which is what lets one index address both.
 */
export const declarations = (css: string): Declaration[] => {
  const found: Declaration[] = [];
  const values = stripNoise(css);
  const selectors = blankNoise(css, true);
  const stack: string[] = [];
  let start = 0;
  let parens = 0;

  const flush = (end: number) => {
    const segment = values.slice(start, end);
    const separator = segment.indexOf(':');

    if (stack.length > 0 && separator !== -1) {
      const value = segment.slice(separator + 1).trim();
      const property = segment.slice(0, separator).trim().toLowerCase();
      if (value) { found.push({context: stack.join(' '), property, value}); }
    }

    start = end + 1;
  };

  for (let index = 0; index < values.length; index++) {
    const character = values[index];

    if (character === '(') { parens++; }
    if (character === ')') { parens = Math.max(0, parens - 1); }
    if (parens !== 0) { continue; }

    if (character === '{') {
      stack.push(selectors.slice(start, index).replace(/\s+/g, ' ').trim());
      start = index + 1;
    } else if (character === '}') {
      flush(index);
      stack.pop();
    } else if (character === ';') {
      flush(index);
    }
  }

  return found;
};

/**
 * Properties whose value can hold a `<color>`, directly or inside a shorthand.
 *
 * Hex and the color functions are only ever colors, so they are read wherever they
 * appear. A bare identifier is not: `animation-name: red` names a keyframe animation
 * and `font-family: black` names a font, and reporting either as a palette violation
 * would be wrong. Named colors are therefore only read here. Custom properties have
 * no property grammar at all, so they count.
 */
const COLOR_SHORTHANDS = [
  'background', 'background-image', 'border', 'border-block', 'border-block-end',
  'border-block-start', 'border-bottom', 'border-image', 'border-image-source',
  'border-inline', 'border-inline-end', 'border-inline-start', 'border-left',
  'border-right', 'border-top', 'box-shadow', 'caret', 'column-rule', 'fill', 'filter',
  'backdrop-filter', 'list-style', 'mask', 'mask-image', 'outline', 'stroke',
  'text-decoration', 'text-emphasis', 'text-shadow', 'text-stroke',
];

export const takesColor = (property: string): boolean => {
  if (property.startsWith('--')) { return true; }

  const name = property.replace(/^-(?:webkit|moz|ms|o)-/, '');

  return name.includes('color') || COLOR_SHORTHANDS.includes(name);
};

const clamp = (value: number, max: number) => Math.min(max, Math.max(0, value));

const channel = (raw: string): number | null => {
  const text = raw.trim();
  const percent = /^(-?[\d.]+)%$/.exec(text);
  // scale by 255/100 rather than by the decimal 2.55, which is not representable in
  // binary: 50 * 2.55 is 127.49999999999999 and rounds to 127, where 50% of 255 is
  // 127.5 and rounds to 128. The two spellings of the same color must agree, or they
  // get different keys and the audit misclassifies one of them.
  if (percent) { return Math.round((clamp(parseFloat(percent[1]), 100) / 100) * 255); }
  return /^-?[\d.]+$/.test(text) ? Math.round(clamp(parseFloat(text), 255)) : null;
};

const alphaChannel = (raw?: string): number | null => {
  if (raw === undefined) { return 1; }
  const text = raw.trim();
  const percent = /^(-?[\d.]+)%$/.exec(text);
  if (percent) { return clamp(parseFloat(percent[1]), 100) / 100; }
  return /^-?[\d.]+$/.test(text) ? clamp(parseFloat(text), 1) : null;
};

/**
 * Only the four lengths CSS defines, and only hex digits. Checking the grammar rather
 * than just the length matters: `#ggg` would otherwise expand to six characters,
 * `parseInt` them to NaN, and hand back an Rgba of NaNs that reads as a resolved
 * color. A malformed *theme* value would then pass the "every color token resolves"
 * spec while generating invalid CSS.
 */
const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/;

const fromHex = (literal: string): Rgba | null => {
  if (!HEX.test(literal.toLowerCase())) { return null; }

  const digits = literal.slice(1);
  const expand = (text: string) => text.split('').map((c) => c + c).join('');
  const full = digits.length === 3 || digits.length === 4 ? expand(digits) : digits;

  return {
    a: full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1,
    b: parseInt(full.slice(4, 6), 16),
    g: parseInt(full.slice(2, 4), 16),
    r: parseInt(full.slice(0, 2), 16),
  };
};

/**
 * Resolves a color literal to channels, or null when it cannot be resolved
 * statically. Returning null is deliberate: `hsl()`, `oklch()` and `color()` fail
 * the audit rather than passing silently, so the escape hatch stays explicit.
 */
export const describeColor = (literal: string): Rgba | null => {
  const text = literal.trim();

  if (text.startsWith('#')) { return fromHex(text.toLowerCase()); }

  const named = NAMED_COLORS[text.toLowerCase()];
  if (named) { return fromHex(named); }

  const fn = /^(rgba?)\((.*)\)$/i.exec(text);
  if (!fn) { return null; }

  const args = fn[2].includes(',')
    ? fn[2].split(',')
    : fn[2].replace(/\//g, ' ').trim().split(/\s+/);

  if (args.length < 3 || args.length > 4) { return null; }

  const [r, g, b] = args.slice(0, 3).map(channel);
  const a = alphaChannel(args[3]);

  return r === null || g === null || b === null || a === null ? null : {a, b, g, r};
};

/**
 * Finds every color literal in a declaration value, at any depth. Functions that
 * merely contain colors are descended into; color functions are terminal.
 *
 * `named` says whether a bare identifier may be read as a color, which depends on the
 * property the value belongs to — see `takesColor`. Hex and the color functions are
 * unambiguous and are found either way. It has no default: defaulting it to `true`
 * would quietly restore the over-eager behaviour for any caller that forgot it.
 */
export const findColors = (value: string, named: boolean): FoundColor[] => {
  const found: FoundColor[] = [];
  let index = 0;

  while (index < value.length) {
    const rest = value.slice(index);

    const call = /^([a-z][\w-]*)\(/i.exec(rest);
    if (call) {
      let depth = 1;
      let cursor = index + call[0].length;
      while (cursor < value.length && depth > 0) {
        if (value[cursor] === '(') { depth++; }
        if (value[cursor] === ')') { depth--; }
        cursor++;
      }
      const literal = value.slice(index, cursor);
      const args = literal.slice(call[0].length, literal.endsWith(')') ? -1 : undefined);

      if (COLOR_FUNCTIONS.includes(call[1].toLowerCase())) {
        found.push({literal, rgba: describeColor(literal)});
      } else {
        found.push(...findColors(args, named));
      }

      index = cursor;
      continue;
    }

    const hex = /^#[0-9a-fA-F]{3,8}\b/.exec(rest);
    if (hex) {
      found.push({literal: hex[0], rgba: describeColor(hex[0])});
      index += hex[0].length;
      continue;
    }

    const word = /^-?[a-zA-Z][\w-]*/.exec(rest);
    if (word) {
      const name = word[0].toLowerCase();
      if (named && NAMED_COLORS[name] && !COLOR_KEYWORDS.includes(name)) {
        found.push({literal: word[0], rgba: describeColor(word[0])});
      }
      index += word[0].length;
      continue;
    }

    index++;
  }

  return found;
};

/** Every color literal written in a stylesheet, in source order. */
export const stylesheetColors = (css: string): StylesheetColor[] =>
  declarations(css).reduce(
    (result: StylesheetColor[], {context, property, value}) => [
      ...result,
      ...findColors(value, takesColor(property)).map((found) => ({...found, context, property})),
    ],
    []
  );

/** Canonical key for comparing two colors. Opaque colors ignore alpha. */
export const colorKey = (rgba: Rgba): string =>
  rgba.a === 1 ? `${rgba.r},${rgba.g},${rgba.b}` : `${rgba.r},${rgba.g},${rgba.b},${rgba.a}`;

/** Key ignoring alpha, so `rgba(0, 0, 0, 0.2)` can be recognised as the theme's black. */
export const opaqueKey = (rgba: Rgba): string => `${rgba.r},${rgba.g},${rgba.b}`;

/**
 * Below: the stylesheet audit itself. It lives here rather than in theme.spec.ts so
 * that the spec and `script/generate-theme-baseline.ts` cannot drift apart — the
 * baseline would otherwise be generated by different logic than it is checked with.
 */

/** Maps a canonical color key to the token that declares it. */
export const themeColorIndex = (): {[key: string]: string} => themeTokens()
  .reduce((result: {[key: string]: string}, [name, value]) => {
    const rgba = describeColor(value);
    return rgba === null ? result : {...result, [colorKey(rgba)]: `--${name}`};
  }, {});

/**
 * Colors that are deliberately not theme values, so they are never reported as
 * unrecognised. Each entry needs a reason: a color only belongs here if snapping it
 * to the nearest palette entry would be a visual change, which is a design decision
 * rather than a refactor.
 */
export const KNOWN_OFF_PALETTE: {[key: string]: string} = {};

export const stylesheetFiles = (srcDir: string): string[] => {
  const walk = (dir: string): string[] => fs.readdirSync(dir, {withFileTypes: true})
    .reduce((result: string[], entry) => {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) { return [...result, ...walk(target)]; }
      return entry.name.endsWith('.css') ? [...result, target] : result;
    }, []);

  return walk(srcDir)
    // generated from the LESS in generic-styles/; styles book content we do not own
    .filter((file) => file !== path.join(srcDir, 'content.css'))
    // the generated token file is the one place a theme value may be written out
    .filter((file) => file !== path.join(srcDir, 'app', 'theme.css'))
    .sort();
};

export interface ColorViolations {
  /** literals that exactly duplicate a value a token already declares */
  duplicates: string[];
  /** literals that are neither a theme value nor allowlisted, including unresolvable ones */
  unknown: string[];
}

/**
 * How a color occurrence is identified in the baseline.
 *
 * File and literal alone are not enough: two `#fff`s in one file would be
 * interchangeable, so deleting one and writing a new one somewhere else in that file
 * would leave the sorted baseline unchanged and slip a fresh hardcoded color past the
 * ratchet. Naming the selector and property pins each occurrence to the declaration it
 * was written in.
 *
 * Deliberately not a line number, which would be a stricter identity but would also
 * churn the baseline every time an unrelated rule is inserted above one — and a
 * baseline regenerated for an unrelated reason is exactly where a new color hides.
 * What is left uncaught is a literal moving between two declarations that share a file,
 * a selector and a property, which is to say the same declaration written twice.
 */
const occurrence = (file: string, found: StylesheetColor) =>
  `${file}: ${found.context} { ${found.property}: ${found.literal} }`;

export const colorViolations = (srcDir: string): ColorViolations => {
  const values = themeColorIndex();
  const duplicates: string[] = [];
  const unknown: string[] = [];

  stylesheetFiles(srcDir).forEach((file) => {
    const name = path.relative(srcDir, file);

    stylesheetColors(fs.readFileSync(file, 'utf8')).forEach((found) => {
      const {rgba} = found;

      if (rgba && values[colorKey(rgba)]) {
        // an exact match is a duplicate. `rgba(0, 0, 0, 0.2)` is not: it is black at
        // 20% and has no token form, so it falls through to the check below and
        // passes there on its opaque channels.
        duplicates.push(`${occurrence(name, found)} is ${values[colorKey(rgba)]}`);
        return;
      }

      const recognised = rgba !== null
        && (values[opaqueKey(rgba)] || KNOWN_OFF_PALETTE[colorKey(rgba)]);

      if (!recognised) {
        // rgba === null lands here on purpose: hsl(), oklch() and color() cannot be
        // resolved statically, so they fail rather than passing silently.
        unknown.push(occurrence(name, found));
      }
    });
  });

  return {duplicates: duplicates.sort(), unknown: unknown.sort()};
};
