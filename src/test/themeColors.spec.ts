// The CSS parser is tested in @openstax/ui-components; these cover REX's side only.

import { colorKey, describeColor } from '@openstax/ui-components/theme/cssColors';
import { themeColorIndex, tokenChoices } from './themeColors';

describe('tokenChoices', () => {
  it('names a single token as itself', () => {
    expect(tokenChoices(['--color-white'])).toEqual('--color-white');
  });

  it('joins two with or', () => {
    expect(tokenChoices(['--color-black', '--color-text-black']))
      .toEqual('--color-black or --color-text-black');
  });

  it('commas all but the last', () => {
    expect(tokenChoices(['--a', '--b', '--c'])).toEqual('--a, --b or --c');
  });
});

describe('themeColorIndex', () => {
  it('keeps every token that carries a color, not just the last one', () => {
    const black = themeColorIndex()[colorKey(describeColor('#000')!)];

    expect(black).toContain('--color-black');
    expect(black).toContain('--color-text-black');
    expect(black.length).toBeGreaterThan(2);
  });

  it('keeps a color that only one token carries', () => {
    expect(themeColorIndex()[colorKey(describeColor('#f4d019')!)])
      .toEqual(['--color-primary-yellow-base']);
  });

  it('offers only --color-* tokens, so a suggestion is always a color token', () => {
    const named = Object.keys(themeColorIndex())
      .reduce((all: string[], key) => all.concat(themeColorIndex()[key]), []);

    expect(named.filter((token) => !token.startsWith('--color-'))).toEqual([]);
  });

  it('leads with the least qualified name, so #fff offers --color-white first', () => {
    expect(themeColorIndex()[colorKey(describeColor('#fff')!)][0]).toEqual('--color-white');
  });

  it('orders by length then alphabetically, so the list is stable', () => {
    const black = themeColorIndex()[colorKey(describeColor('#000')!)];
    const lengths = black.map((token) => token.length);

    expect(lengths).toEqual([...lengths].sort((a, b) => a - b));
    expect(black[0]).toEqual('--color-black');
  });
});
