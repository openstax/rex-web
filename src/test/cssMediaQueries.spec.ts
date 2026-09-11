import { mediaWidths } from './cssMediaQueries';

const sizes = (css: string) => mediaWidths(css).map(({size}) => size);
const query = (feature: string) => `@media ${feature} { .a { padding: 0; } }`;

describe('mediaWidths', () => {
  it.each([
    ['a max-width query', '(max-width: 75em)'],
    ['a min-width query', '(min-width: 75em)'],
    ['an exact width query', '(width: 75em)'],
    // the range forms this repo's stylelint config allows -- the reason this is
    // parsed rather than matched with a regex for `(min-width:`
    ['a <= range', '(width <= 75em)'],
    ['a < range', '(width < 75em)'],
    ['a >= range', '(width >= 75em)'],
    ['a reversed range', '(75em >= width)'],
    // stylelint asks for spaces around the operator, but the audit must not depend
    // on another check having passed first
    ['a range with no spaces', '(width<=75em)'],
    ['a deprecated device-width query', '(max-device-width: 75em)'],
    ['a media type as well', 'screen and (max-width: 75em)'],
    ['an uppercase feature name', '(MAX-WIDTH: 75em)'],
  ])('reads the endpoint of %s', (_case, feature) => {
    expect(sizes(query(feature))).toEqual([75]);
  });

  describe('dimensions', () => {
    it.each([
      ['an integer', '(max-width: 74em)'],
      ['a decimal', '(max-width: 74.0em)'],
      // 7.4e1 is 74: a valid CSS dimension whose number carries an exponent. Matching
      // `[\d.]+em` reads the tail of it as `1em`, so this exact typo -- a 75em meant,
      // 74em written -- sat 1em from nothing and passed.
      ['an exponent', '(max-width: 7.4e1em)'],
      ['an uppercase exponent', '(max-width: 7.4E1em)'],
      ['a negative exponent', '(max-width: 740000e-4em)'],
      ['an explicitly positive exponent', '(max-width: 7.4e+1em)'],
      ['a unit in capitals', '(max-width: 74EM)'],
    ])('reads %s', (_case, feature) => {
      expect(sizes(query(feature))).toEqual([74]);
    });

    it('reads a decimal with no integer part', () => {
      expect(sizes(query('(min-width: .5em)'))).toEqual([0.5]);
    });
  });

  describe('calc()', () => {
    it('adds the terms, rather than reporting each length in it', () => {
      // (min-width: calc(49em + 1em)) is the 50em theme breakpoint exactly. Read as
      // two endpoints it was 49em and 1em, and the 49 then failed the proximity
      // check -- a false failure on valid CSS.
      expect(sizes(query('(min-width: calc(49em + 1em))'))).toEqual([50]);
    });

    it('subtracts as well, so a calc can still be a mistyped breakpoint', () => {
      expect(sizes(query('(max-width: calc(75em - 1em))'))).toEqual([74]);
    });

    it('reads a sum of more than two terms', () => {
      expect(sizes(query('(min-width: calc(40em + 9em + 1em))'))).toEqual([50]);
    });

    it('resolves a sum in another unit, which is then out of scope', () => {
      expect(sizes(query('(max-width: calc(1200px + 1px))'))).toEqual([]);
    });

    it.each([
      // each of these is a length this cannot work out, so it is reported rather
      // than skipped -- see the note on MediaWidth.size
      ['multiplication', '(max-width: calc(37em * 2))'],
      ['division', '(max-width: calc(148em / 2))'],
      ['nested parens', '(max-width: calc((49em + 1em) * 2))'],
      ['a mix of units', '(max-width: calc(75em + 1px))'],
      ['a unitless term', '(max-width: calc(74em + 1))'],
      ['a term that is not a length', '(max-width: calc(74em + foo))'],
      ['another function', '(max-width: min(74em, 80em))'],
      ['a var()', '(max-width: var(--page-width))'],
    ])('reports %s as unresolved', (_case, feature) => {
      expect(sizes(query(feature))).toEqual([null]);
    });
  });

  it('reads a query whose at-rule is in capitals', () => {
    expect(sizes('@MEDIA (max-width: 75em) { .a { padding: 0; } }')).toEqual([75]);
  });

  it('reads both endpoints of a double-ended range', () => {
    // the case a single `exec` would have truncated to the first endpoint
    expect(sizes(query('(30em < width <= 74em)'))).toEqual([30, 74]);
  });

  it('reads each feature of a compound query', () => {
    expect(sizes(query('screen and (min-width: 50em) and (max-width: 74em)')))
      .toEqual([50, 74]);
  });

  it('reads each query of a comma-separated list', () => {
    expect(sizes(query('(max-width: 30em), print and (min-width: 74em)')))
      .toEqual([30, 74]);
  });

  it('reads a query nested inside another block', () => {
    expect(sizes('.a { color: red; @media (max-width: 74em) { color: blue; } }'))
      .toEqual([74]);
  });

  it('keeps the feature as written, so a failure names the query', () => {
    expect(mediaWidths(query('screen and (30em  <  width)')))
      .toEqual([{query: '(30em < width)', size: 30}]);
  });

  it.each([
    ['a feature that is not about width', '(min-height: 74em)'],
    ['a feature with no length', '(min-resolution: 2dppx)'],
    ['a boolean width feature', '(width)'],
    ['a media type on its own', 'print'],
    // the theme's breakpoints are em; px cannot be compared without assuming a root
    // font size, so it is skipped rather than guessed at
    ['a width in px', '(max-width: 1200px)'],
    ['a width in rem', '(max-width: 74rem)'],
    ['a zero width', '(min-width: 0)'],
  ])('ignores %s', (_case, feature) => {
    expect(sizes(query(feature))).toEqual([]);
  });

  it.each([
    // the reason preludes are read rather than the whole stylesheet: both of these
    // put `width` and an em length in a declaration, where they are not breakpoints
    ['a width declaration', '.a { width: 74em; }'],
    ['a width custom property', '.a { --page-width: 74em; }'],
    ['a var() fallback', '.a { max-width: var(--width, 74em); }'],
  ])('does not read %s as a breakpoint', (_case, css) => {
    expect(sizes(css)).toEqual([]);
  });

  it('ignores a commented-out query', () => {
    expect(sizes('/* @media (max-width: 74em) { .a {} } */ .b { color: red; }')).toEqual([]);
  });

  it('ignores a query inside a string', () => {
    expect(sizes('.a::before { content: "@media (max-width: 74em)"; }')).toEqual([]);
  });

  it('stops a prelude at a semicolon rather than swallowing the stylesheet', () => {
    expect(sizes('@media (max-width: 74em);\n.a { max-width: 75em; }')).toEqual([74]);
  });

  it('tolerates a prelude that never opens a block', () => {
    expect(sizes('@media (max-width: 74em)')).toEqual([74]);
  });

  it('tolerates an unbalanced feature', () => {
    expect(() => mediaWidths('@media (max-width: 74em { .a {} }')).not.toThrow();
  });

  it('finds nothing in a stylesheet with no media queries', () => {
    expect(sizes('.a { color: red; }')).toEqual([]);
  });
});
