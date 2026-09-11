import {
  colorKey,
  declarations,
  describeColor,
  opaqueKey,
  stripNoise,
  stylesheetColors,
  takesColor,
} from './cssColors';

const literals = (css: string) => stylesheetColors(css).map((found) => found.literal);
const values = (css: string) => declarations(css).map((declaration) => declaration.value);

describe('stripNoise', () => {
  it('removes block comments', () => {
    expect(stripNoise('a { /* #ff0000 */ color: red; }')).not.toContain('#ff0000');
  });

  it('removes string contents so content: "tan" is not a color', () => {
    expect(stripNoise('a { content: "tan"; }')).not.toContain('tan');
  });

  it('removes url() payloads', () => {
    const blanked = stripNoise('a { background: url(data:image/svg+xml;base64,Zm9v) no-repeat; }');
    expect(blanked).not.toContain('base64');
    expect(blanked).toContain('no-repeat');
  });

  it('keeps the url() parentheses, which are structure rather than noise', () => {
    // declarations balances parens to know a `;` inside url() is not a separator
    expect(stripNoise('a { background: url(x;y); }')).toContain('url(');
    expect(stripNoise('a { background: url(x;y); }')).toContain(')');
  });

  it('handles an escaped quote inside a string', () => {
    expect(stripNoise('a { content: "a\\"b"; }')).not.toContain('b"');
  });

  it('tolerates an unterminated comment', () => {
    expect(stripNoise('a { color: red; /* oops')).toContain('color: red;');
  });

  it.each([
    ['a comment', 'a { /* note */ color: red; }'],
    ['a string', 'a { content: "tan"; }'],
    ['an unterminated string', 'a { content: "tan }'],
    ['a url()', 'a { background: url(data:image/svg+xml;base64,Zm9v); }'],
    ['an unterminated url()', 'a { background: url(oops }'],
    ['an unterminated comment', 'a { color: red; /* oops'],
  ])('blanks %s without changing the length', (_case, css) => {
    // declarations addresses two differently-blanked copies with one index, so this
    // is load-bearing rather than cosmetic: a length change silently misaligns context.
    expect(stripNoise(css)).toHaveLength(css.length);
  });
});

describe('declarations', () => {
  it('reads declarations at the top level of a rule', () => {
    expect(values('a { color: red; background: blue; }')).toEqual(['red', 'blue']);
  });

  it('reads declarations nested in @media', () => {
    expect(values('@media (max-width: 50em) { a { color: red; } }')).toEqual(['red']);
  });

  it('does not mistake a pseudo-class selector for a declaration', () => {
    expect(values('a:hover { color: red; }')).toEqual(['red']);
  });

  it('does not mistake @keyframes percentages for declarations', () => {
    expect(values('@keyframes f { 0% { opacity: 0; } 100% { opacity: 1; } }'))
      .toEqual(['0', '1']);
  });

  it('ignores at-rules outside a block, such as @import', () => {
    expect(values('@import "./theme.css";')).toEqual([]);
  });

  it('reads a declaration with no trailing semicolon', () => {
    expect(values('a { color: red }')).toEqual(['red']);
  });

  it('does not split on a semicolon inside parentheses', () => {
    expect(values('a { background: url(x;y); color: red; }')).toContain('red');
  });

  it('keeps a custom property declaration', () => {
    expect(values(':root { --color-x: #fff; }')).toEqual(['#fff']);
  });

  it('lower-cases the property name', () => {
    expect(declarations('a { COLOR: red; }')[0].property).toEqual('color');
  });

  it('records the selector as context', () => {
    expect(declarations('a:hover .thing { color: red; }')[0].context)
      .toEqual('a:hover .thing');
  });

  it('collapses whitespace in the context', () => {
    expect(declarations('a,\n  b {\n  color: red;\n}')[0].context).toEqual('a, b');
  });

  it('nests the at-rule prelude and the selector in the context', () => {
    expect(declarations('@media (max-width: 50em) { a { color: red; } }')[0].context)
      .toEqual('@media (max-width: 50em) a');
  });

  it('pops the context again after a nested block closes', () => {
    const parsed = declarations('@media (max-width: 50em) { a { color: red; } } b { color: blue; }');
    expect(parsed.map(({context}) => context))
      .toEqual(['@media (max-width: 50em) a', 'b']);
  });

  it('keeps string contents in the context, so attribute selectors stay distinct', () => {
    // the baseline identifies an occurrence by its context, so two rules that differ
    // only inside a selector string must not reduce to the same one -- otherwise a
    // literal could move between them and the ratchet would see no change.
    const parsed = declarations(
      '.x[data-loading="true"] { color: #fff; } .x[data-loading="false"] { color: #fff; }'
    );

    expect(parsed.map(({context}) => context))
      .toEqual(['.x[data-loading="true"]', '.x[data-loading="false"]']);
  });

  it('still blanks strings in the value, where they are not colors', () => {
    // the other half of the same change: context keeps strings, values must not, or
    // `content: "#fff"` starts reading as a color.
    expect(declarations('a { content: "#fff"; }')).toEqual([]);
  });

  it('does not let a brace inside a selector string open a block', () => {
    expect(declarations('.x[data-glyph="{"] { color: red; }'))
      .toEqual([{context: '.x[data-glyph="{"]', property: 'color', value: 'red'}]);
  });
});

describe('takesColor', () => {
  it.each(['color', 'background-color', 'border-top-color', '-webkit-text-fill-color'])(
    'accepts %s, which names a color', (property) => {
      expect(takesColor(property)).toBe(true);
    }
  );

  it.each(['background', 'border', 'border-left', 'box-shadow', 'outline', 'fill'])(
    'accepts the %s shorthand', (property) => {
      expect(takesColor(property)).toBe(true);
    }
  );

  it('accepts a custom property, which has no grammar to go on', () => {
    expect(takesColor('--book-banner-background')).toBe(true);
  });

  it.each(['animation-name', 'font-family', 'transition-property', 'grid-area'])(
    'rejects %s, where an identifier is not a color', (property) => {
      expect(takesColor(property)).toBe(false);
    }
  );

  it('sees through a vendor prefix', () => {
    expect(takesColor('-webkit-box-shadow')).toBe(true);
  });
});

describe('findColors', () => {
  it('finds a hex literal', () => {
    expect(literals('a { color: #ff0000; }')).toEqual(['#ff0000']);
  });

  it('finds a bare named color in a shorthand', () => {
    expect(literals('a { border: 0.1rem solid red; }')).toEqual(['red']);
  });

  it('finds colors in gradient stops', () => {
    expect(literals('a { background: linear-gradient(to top, #fff 0%, #000 100%); }'))
      .toEqual(['#fff', '#000']);
  });

  it('descends into var() fallbacks rather than treating var() as a literal', () => {
    expect(literals('a { color: var(--x, #fff); }')).toEqual(['#fff']);
  });

  it('descends into color-mix() over tokens and finds nothing', () => {
    expect(literals('a { color: color-mix(in srgb, var(--a), var(--b)); }')).toEqual([]);
  });

  it('finds rgba()', () => {
    expect(literals('a { box-shadow: 0 0 0.2rem rgba(0, 0, 0, 0.2); }'))
      .toEqual(['rgba(0, 0, 0, 0.2)']);
  });

  it('finds hsl(), which resolves to null so it cannot pass silently', () => {
    const found = stylesheetColors('a { color: hsl(0deg 100% 50%); }');
    expect(found).toHaveLength(1);
    expect(found[0].rgba).toBeNull();
  });

  it('finds oklch(), which resolves to null', () => {
    expect(stylesheetColors('a { color: oklch(0.7 0.1 200); }')[0].rgba).toBeNull();
  });

  it('flags rgba() over a var() channel list rather than skipping it', () => {
    const found = stylesheetColors('a { color: rgba(var(--channels), 0.2); }');
    expect(found).toHaveLength(1);
    expect(found[0].rgba).toBeNull();
  });

  it('does not treat a class selector named .red as a color', () => {
    expect(literals('.red { opacity: 1; }')).toEqual([]);
  });

  it('does not treat content: "tan" as a color', () => {
    expect(literals('a { content: "tan"; }')).toEqual([]);
  });

  it('does not treat a color inside a comment as a color', () => {
    expect(literals('a { /* was #ff0000 */ color: var(--x); }')).toEqual([]);
  });

  it('does not treat transparent or currentcolor as comparable colors', () => {
    expect(literals('a { color: currentcolor; background: transparent; }')).toEqual([]);
  });

  it('does not treat a non-color keyword as a color', () => {
    expect(literals('a { transition: all 0.2s linear; }')).toEqual([]);
  });

  it('finds several colors in one declaration', () => {
    expect(literals('a { box-shadow: 0 0 0 red, 0 0 0 #00f; }')).toEqual(['red', '#00f']);
  });

  it('tolerates an unbalanced function call', () => {
    expect(() => literals('a { color: rgb(0, 0, 0; }')).not.toThrow();
  });

  it.each([
    ['an animation name', 'a { animation-name: red; }'],
    ['a font family', 'a { font-family: black; }'],
    ['a transitioned property', 'a { transition-property: tan; }'],
    ['a grid area', 'a { grid-area: navy; }'],
    // the property gate has to survive the descent into a function, not just the
    // top level of the value -- findColors passes `named` down to itself.
    ['a var() fallback under one', 'a { animation-name: var(--enter, red); }'],
  ])('does not read %s as a named color', (_case, css) => {
    expect(literals(css)).toEqual([]);
  });

  it.each([
    ['a color property', 'a { color: red; }'],
    ['a shorthand', 'a { border: 0.1rem solid red; }'],
    ['a custom property', 'a { --x: red; }'],
    ['a box-shadow', 'a { box-shadow: 0 0 0.2rem red; }'],
    ['a vendor-prefixed property', 'a { -webkit-text-fill-color: red; }'],
    // the other side of the descent: gating named colors on the property must not
    // stop finding them inside a function the walk descends into.
    ['a gradient stop', 'a { background: linear-gradient(to top, red, transparent); }'],
  ])('still reads a named color in %s', (_case, css) => {
    expect(literals(css)).toEqual(['red']);
  });

  it('still reads hex and rgb() in a property that cannot take a named color', () => {
    // only the bare-identifier case is property-sensitive: `#fff` and `rgb(...)` are
    // colors wherever they are written, so they stay in scope everywhere.
    expect(literals('a { animation-name: #fff; transition-property: rgb(0, 0, 0); }'))
      .toEqual(['#fff', 'rgb(0, 0, 0)']);
  });

  it('records the declaration each color was written in', () => {
    expect(stylesheetColors('@media (max-width: 50em) { .a:hover { color: #fff; } }'))
      .toEqual([{
        context: '@media (max-width: 50em) .a:hover',
        literal: '#fff',
        property: 'color',
        rgba: {a: 1, b: 255, g: 255, r: 255},
      }]);
  });
});

describe('describeColor', () => {
  it('expands 3-digit hex', () => {
    expect(describeColor('#fff')).toEqual({a: 1, b: 255, g: 255, r: 255});
  });

  it('reads 8-digit hex alpha', () => {
    expect(describeColor('#00000033')?.a).toBeCloseTo(0.2, 1);
  });

  it('reads 4-digit hex', () => {
    expect(describeColor('#0000')).toEqual({a: 0, b: 0, g: 0, r: 0});
  });

  it('is case insensitive', () => {
    expect(describeColor('#027EB5')).toEqual(describeColor('#027eb5'));
  });

  it('resolves a named color', () => {
    expect(describeColor('white')).toEqual({a: 1, b: 255, g: 255, r: 255});
  });

  it('reads comma-separated rgb()', () => {
    expect(describeColor('rgb(255, 0, 0)')).toEqual({a: 1, b: 0, g: 0, r: 255});
  });

  it('reads space-separated rgb() with a slash alpha', () => {
    expect(describeColor('rgb(255 0 0 / 0.5)')).toEqual({a: 0.5, b: 0, g: 0, r: 255});
  });

  it('reads percentage channels', () => {
    expect(describeColor('rgb(100%, 0%, 0%)')).toEqual({a: 1, b: 0, g: 0, r: 255});
  });

  it('reads a percentage alpha', () => {
    expect(describeColor('rgba(0, 0, 0, 20%)')?.a).toBeCloseTo(0.2);
  });

  it('returns null for hsl()', () => {
    expect(describeColor('hsl(0, 100%, 50%)')).toBeNull();
  });

  it('returns null for a non-numeric channel', () => {
    expect(describeColor('rgb(var(--x), 0, 0)')).toBeNull();
  });

  it('returns null for the wrong number of channels', () => {
    expect(describeColor('rgb(0, 0)')).toBeNull();
  });

  it('returns null for an unknown identifier', () => {
    expect(describeColor('notacolor')).toBeNull();
  });

  it.each(['#12345', '#1234567', '#123456789'])(
    'returns null for the malformed hex length %s', (literal) => {
      expect(describeColor(literal)).toBeNull();
    }
  );

  it.each(['#ggg', '#gggggg', '#12345g'])(
    'returns null for %s rather than a set of NaN channels', (literal) => {
      // the length is right, so only checking the length would hand back
      // {r: NaN, g: NaN, b: NaN} and read as a resolved color.
      expect(describeColor(literal)).toBeNull();
    }
  );

  it('rounds a percentage channel the same way as its integer spelling', () => {
    // 50% of 255 is 127.5, which rounds to 128. Scaling by the decimal 2.55 gives
    // 127.49999999999999 and rounds to 127, so the two spellings would disagree.
    expect(describeColor('rgb(50%, 50%, 50%)')).toEqual({a: 1, b: 128, g: 128, r: 128});
    expect(describeColor('rgb(50%, 50%, 50%)')).toEqual(describeColor('rgb(128, 128, 128)'));
  });
});

describe('color keys', () => {
  it('treats an opaque color as equal however it is written', () => {
    expect(colorKey(describeColor('#fff')!)).toEqual(colorKey(describeColor('white')!));
  });

  it('distinguishes a translucent color from its opaque form', () => {
    expect(colorKey(describeColor('rgba(0, 0, 0, 0.2)')!))
      .not.toEqual(colorKey(describeColor('#000')!));
  });

  it('recognises a translucent color by its opaque channels', () => {
    expect(opaqueKey(describeColor('rgba(0, 0, 0, 0.2)')!))
      .toEqual(opaqueKey(describeColor('#000')!));
  });
});
