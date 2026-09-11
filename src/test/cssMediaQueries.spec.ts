import { mediaWidths } from './cssMediaQueries';

const sizes = (css: string) => mediaWidths(css).map(({size}) => size);

describe('mediaWidths', () => {
  it.each([
    ['a max-width query', '@media (max-width: 75em) { .a { color: red; } }'],
    ['a min-width query', '@media (min-width: 75em) { .a { color: red; } }'],
    ['an exact width query', '@media (width: 75em) { .a { color: red; } }'],
    // the range forms this repo's stylelint config allows -- the reason this is
    // parsed rather than matched with a regex for `(min-width:`
    ['a <= range', '@media (width <= 75em) { .a { color: red; } }'],
    ['a < range', '@media (width < 75em) { .a { color: red; } }'],
    ['a >= range', '@media (width >= 75em) { .a { color: red; } }'],
    ['a reversed range', '@media (75em >= width) { .a { color: red; } }'],
    // stylelint asks for spaces around the operator, but the audit must not depend
    // on another check having passed first
    ['a range with no spaces', '@media (width<=75em) { .a { color: red; } }'],
    ['a deprecated device-width query', '@media (max-device-width: 75em) { .a {} }'],
    ['a media type as well', '@media screen and (max-width: 75em) { .a {} }'],
    ['an uppercase at-rule', '@MEDIA (MAX-WIDTH: 75em) { .a {} }'],
  ])('reads the endpoint of %s', (_case, css) => {
    expect(sizes(css)).toEqual([75]);
  });

  it('reads both endpoints of a double-ended range', () => {
    // the case a single `exec` would have truncated to the first endpoint
    expect(sizes('@media (30em < width <= 74em) { .a {} }')).toEqual([30, 74]);
  });

  it('reads each feature of a compound query', () => {
    expect(sizes('@media screen and (min-width: 50em) and (max-width: 74em) { .a {} }'))
      .toEqual([50, 74]);
  });

  it('reads each query of a comma-separated list', () => {
    expect(sizes('@media (max-width: 30em), print and (min-width: 74em) { .a {} }'))
      .toEqual([30, 74]);
  });

  it('reads a query nested inside another block', () => {
    expect(sizes('.a { color: red; @media (max-width: 74em) { color: blue; } }'))
      .toEqual([74]);
  });

  it('keeps the feature as written, so a failure names the query', () => {
    expect(mediaWidths('@media screen and (30em  <  width) { .a {} }'))
      .toEqual([{query: '(30em < width)', size: 30}]);
  });

  it.each([
    ['a feature that is not about width', '@media (min-height: 74em) { .a {} }'],
    ['a feature with no length', '@media (min-resolution: 2dppx) { .a {} }'],
    ['a media type on its own', '@media print { .a {} }'],
    // the theme's breakpoints are em; px cannot be compared without assuming a root
    // font size, so it is skipped rather than guessed at
    ['a width in px', '@media (max-width: 1200px) { .a {} }'],
    ['a width in rem', '@media (max-width: 74rem) { .a {} }'],
  ])('ignores %s', (_case, css) => {
    expect(sizes(css)).toEqual([]);
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

  it('reads a feature whose value is a function, without splitting it', () => {
    // balanced parens rather than a match to the next `)`
    expect(sizes('@media (min-width: calc(75em + 1px)) { .a {} }')).toEqual([75]);
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
