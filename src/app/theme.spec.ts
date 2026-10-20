/**
 * Checks that theme.css matches the theme and that stylesheets use its tokens. Jest
 * mocks CSS imports, so the stylesheets are read from disk.
 */
import { describeColor, stripNoise } from '@openstax/ui-components/theme/cssColors';
import fs from 'fs';
import path from 'path';
import { mediaWidths } from '../test/cssMediaQueries';
import { colorViolations, stylesheetFiles, tokenChoices } from '../test/themeColors';
import theme from './theme';
import { themeCss, themeTokens } from './themeCss';

const srcDir = path.join(__dirname, '..');
const themeCssPath = path.join(__dirname, 'theme.css');
const baselinePath = path.join(__dirname, 'theme.baseline.json');

const relative = (file: string) => path.relative(srcDir, file);

/** The locked color violations. See PLAIN_CSS_MIGRATION_GUIDE.md, Pattern 2.5. */
const baseline = (): {duplicates: string[], unknown: string[]} =>
  JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

/**
 * Compares the violations found with the baseline and returns what was added and
 * removed. Repeats are counted, since one declaration can repeat a color (a gradient
 * with two `#fff` stops). `annotate` adds a suggested fix to added entries only.
 */
const ratchet = (found: string[], locked: string[], annotate = (entry: string) => entry) => {
  const unmatched = new Map<string, number>();
  locked.forEach((entry) => unmatched.set(entry, (unmatched.get(entry) || 0) + 1));

  const added = found.filter((entry) => {
    const count = unmatched.get(entry) || 0;
    if (count === 0) { return true; }
    unmatched.set(entry, count - 1);
    return false;
  });

  const removed: string[] = [];
  unmatched.forEach((count, entry) => {
    for (let repeat = 0; repeat < count; repeat++) { removed.push(entry); }
  });

  return {added: added.map(annotate), removed: removed.sort()};
};

const noDrift = {added: [], removed: []};

/**
 * True when a breakpoint is within 1em of an accepted value without matching it, which
 * usually means a typo, such as 74em for 75em.
 */
const suspiciousBreakpoint = (accepted: number[]) => (size: number) =>
  !accepted.includes(size) && accepted.some((edge) => Math.abs(edge - size) <= 1);

describe('the baseline ratchet', () => {
  const entry = (n: number) => `a.css: .x { color: #00${n} }`;

  it('reports no drift when the tree matches the baseline', () => {
    expect(ratchet([entry(1), entry(2)], [entry(2), entry(1)])).toEqual(noDrift);
  });

  it('reports a new violation as added', () => {
    expect(ratchet([entry(1), entry(2)], [entry(1)]))
      .toEqual({added: [entry(2)], removed: []});
  });

  it('reports a fixed violation as removed', () => {
    expect(ratchet([entry(1)], [entry(1), entry(2)]))
      .toEqual({added: [], removed: [entry(2)]});
  });

  it('counts repeats, so fixing one of two identical occurrences is removed', () => {
    expect(ratchet([entry(1)], [entry(1), entry(1)]))
      .toEqual({added: [], removed: [entry(1)]});
  });

  it('counts repeats, so a second copy of an existing occurrence is added', () => {
    expect(ratchet([entry(1), entry(1)], [entry(1)]))
      .toEqual({added: [entry(1)], removed: []});
  });

  it('annotates what was added, so a new violation says what to use instead', () => {
    expect(ratchet([entry(1)], [], (found) => `${found} -- use --color-x`))
      .toEqual({added: [`${entry(1)} -- use --color-x`], removed: []});
  });

  it('leaves what was removed unannotated, since it matches a baseline entry', () => {
    expect(ratchet([], [entry(1)], (found) => `${found} -- use --color-x`))
      .toEqual({added: [], removed: [entry(1)]});
  });
});

describe('the breakpoint proximity rule', () => {
  // 30 and 50 stand in for theme breakpoints, 30.0625 and 50.0625 for their desktop sides
  const suspicious = suspiciousBreakpoint([30, 30.0625, 50, 50.0625]);

  it.each([30, 30.0625, 50, 50.0625])('accepts %sem, which is a boundary', (size) => {
    expect(suspicious(size)).toBe(false);
  });

  it.each([29, 31, 49, 51])('catches %sem, which is 1em from a theme value', (size) => {
    expect(suspicious(size)).toBe(true);
  });

  it.each([31.0625, 51.0625])(
    'catches %sem, which is 1em from a desktop-side boundary', (size) => {
      expect(suspicious(size)).toBe(true);
    }
  );

  it.each([28, 37.5, 60.1, 90])('accepts %sem, which is a deliberate breakpoint', (size) => {
    // e.g. Footer uses 37.5em, 60.1em and 90em
    expect(suspicious(size)).toBe(false);
  });
});

describe('theme.css', () => {
  it('is exactly what the generator produces from the JS theme', () => {
    expect(fs.readFileSync(themeCssPath, 'utf8')).toEqual(themeCss());
  });

  it('resolves every color token to real channels', () => {
    // an unresolvable token would silently drop out of the color index
    const unresolvable = themeTokens()
      .filter(([name]) => name.startsWith('color-'))
      .filter(([, value]) => describeColor(value) === null)
      .map(([name]) => `--${name}`);

    expect(unresolvable).toEqual([]);
  });
});

describe('stylesheets', () => {
  it('were found, so the audit cannot pass vacuously', () => {
    expect(stylesheetFiles(srcDir).length).toBeGreaterThan(50);
  });

  it('do not duplicate a theme color beyond the baseline', () => {
    const {duplicates, tokens} = colorViolations(srcDir);

    const annotate = (entry: string) => `${entry} -- use ${tokenChoices(tokens[entry])}`;

    expect(ratchet(duplicates, baseline().duplicates, annotate)).toEqual(noDrift);
  });

  it('do not introduce an unrecognised color beyond the baseline', () => {
    expect(ratchet(colorViolations(srcDir).unknown, baseline().unknown)).toEqual(noDrift);
  });

  it('do not read a global token that does not exist', () => {
    const declared = new Set(themeTokens().map(([name]) => `--${name}`));
    const globalFamilies = /^--(color|z-index|padding)-/;

    const missing: string[] = [];

    for (const file of stylesheetFiles(srcDir)) {
      const read = stripNoise(fs.readFileSync(file, 'utf8')).match(/var\(\s*(--[\w-]+)/g) || [];

      read
        .map((match) => match.replace(/var\(\s*/, ''))
        .filter((name) => globalFamilies.test(name) && !declared.has(name))
        .forEach((name) => missing.push(`${relative(file)}: ${name}`));
    }

    expect(missing).toEqual([]);
  });

  it('do not use a breakpoint suspiciously close to a theme breakpoint', () => {
    const themeBreaks = [
      theme.breakpoints.mobileSmallBreak,
      theme.breakpoints.mobileMediumBreak,
      theme.breakpoints.mobileBreak,
    ];
    // the desktop side of a max-width query is the theme value + 0.0625, per desktopBreak
    const accepted = themeBreaks.reduce(
      (result: number[], size) => [...result, size, size + 0.0625],
      []
    );

    const suspicious: string[] = [];
    const near = suspiciousBreakpoint(accepted);

    for (const file of stylesheetFiles(srcDir)) {
      for (const {query, size} of mediaWidths(fs.readFileSync(file, 'utf8'))) {
        // an endpoint that cannot be resolved could hide a typo, so it is reported
        if (size === null) {
          suspicious.push(`${relative(file)}: ${query} -- not resolvable to a width in em`);
        } else if (near(size)) {
          suspicious.push(`${relative(file)}: ${query}`);
        }
      }
    }

    expect(suspicious).toEqual([]);
  });
});
