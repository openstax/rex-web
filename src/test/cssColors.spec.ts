import {
  colorKey,
  declarationValues,
  describeColor,
  findColors,
  opaqueKey,
  stripNoise,
  stylesheetColors,
} from './cssColors';

const literals = (css: string) => stylesheetColors(css).map((found) => found.literal);

describe('stripNoise', () => {
  it('removes block comments', () => {
    expect(stripNoise('a { /* #ff0000 */ color: red; }')).not.toContain('#ff0000');
  });

  it('removes string contents so content: "tan" is not a colour', () => {
    expect(stripNoise('a { content: "tan"; }')).toContain('content: ""');
  });

  it('removes url() payloads', () => {
    expect(stripNoise('a { background: url(data:image/svg+xml;base64,Zm9v) no-repeat; }'))
      .toContain('url() no-repeat');
  });

  it('handles an escaped quote inside a string', () => {
    expect(stripNoise('a { content: "a\\"b"; }')).toContain('content: ""');
  });

  it('tolerates an unterminated comment', () => {
    expect(stripNoise('a { color: red; /* oops')).toContain('color: red;');
  });
});

describe('declarationValues', () => {
  it('reads declarations at the top level of a rule', () => {
    expect(declarationValues('a { color: red; background: blue; }'))
      .toEqual(['red', 'blue']);
  });

  it('reads declarations nested in @media', () => {
    expect(declarationValues('@media (max-width: 50em) { a { color: red; } }'))
      .toEqual(['red']);
  });

  it('does not mistake a pseudo-class selector for a declaration', () => {
    expect(declarationValues('a:hover { color: red; }')).toEqual(['red']);
  });

  it('does not mistake @keyframes percentages for declarations', () => {
    expect(declarationValues('@keyframes f { 0% { opacity: 0; } 100% { opacity: 1; } }'))
      .toEqual(['0', '1']);
  });

  it('ignores at-rules outside a block, such as @import', () => {
    expect(declarationValues('@import "./theme.css";')).toEqual([]);
  });

  it('reads a declaration with no trailing semicolon', () => {
    expect(declarationValues('a { color: red }')).toEqual(['red']);
  });

  it('does not split on a semicolon inside parentheses', () => {
    const values = declarationValues('a { background: url(x;y); color: red; }');
    expect(values).toContain('red');
  });

  it('keeps a custom property declaration', () => {
    expect(declarationValues(':root { --color-x: #fff; }')).toEqual(['#fff']);
  });
});

describe('findColors', () => {
  it('finds a hex literal', () => {
    expect(literals('a { color: #ff0000; }')).toEqual(['#ff0000']);
  });

  it('finds a bare named colour in a shorthand', () => {
    expect(literals('a { border: 0.1rem solid red; }')).toEqual(['red']);
  });

  it('finds colours in gradient stops', () => {
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

  it('does not treat a class selector named .red as a colour', () => {
    expect(literals('.red { opacity: 1; }')).toEqual([]);
  });

  it('does not treat content: "tan" as a colour', () => {
    expect(literals('a { content: "tan"; }')).toEqual([]);
  });

  it('does not treat a colour inside a comment as a colour', () => {
    expect(literals('a { /* was #ff0000 */ color: var(--x); }')).toEqual([]);
  });

  it('does not treat transparent or currentcolor as comparable colours', () => {
    expect(literals('a { color: currentcolor; background: transparent; }')).toEqual([]);
  });

  it('does not treat a non-colour keyword as a colour', () => {
    expect(literals('a { transition: all 0.2s linear; }')).toEqual([]);
  });

  it('finds several colours in one declaration', () => {
    expect(literals('a { box-shadow: 0 0 0 red, 0 0 0 #00f; }')).toEqual(['red', '#00f']);
  });

  it('tolerates an unbalanced function call', () => {
    expect(() => literals('a { color: rgb(0, 0, 0; }')).not.toThrow();
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

  it('resolves a named colour', () => {
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
    expect(describeColor('notacolour')).toBeNull();
  });

  it('returns null for a malformed hex length', () => {
    expect(describeColor('#12345')).toBeNull();
  });
});

describe('colour keys', () => {
  it('treats an opaque colour as equal however it is written', () => {
    expect(colorKey(describeColor('#fff')!)).toEqual(colorKey(describeColor('white')!));
  });

  it('distinguishes a translucent colour from its opaque form', () => {
    expect(colorKey(describeColor('rgba(0, 0, 0, 0.2)')!))
      .not.toEqual(colorKey(describeColor('#000')!));
  });

  it('recognises a translucent colour by its opaque channels', () => {
    expect(opaqueKey(describeColor('rgba(0, 0, 0, 0.2)')!))
      .toEqual(opaqueKey(describeColor('#000')!));
  });
});
