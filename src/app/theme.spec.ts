/**
 * Keeps the theme and the stylesheets honest.
 *
 * Jest maps `*.css` imports to a style mock, so these read the stylesheets off disk
 * with `fs` instead of importing them. The audit itself lives in src/test/cssColors.ts,
 * shared with `script/generate-theme-baseline.ts` so the two cannot disagree.
 */
import fs from 'fs';
import path from 'path';
import { colorViolations, describeColor, stripNoise, stylesheetFiles } from '../test/cssColors';
import theme from './theme';
import { themeCss, themeTokens } from './themeCss';

const srcDir = path.join(__dirname, '..');
const themeCssPath = path.join(__dirname, 'theme.css');
const baselinePath = path.join(__dirname, 'theme.baseline.json');

const relative = (file: string) => path.relative(srcDir, file);

/**
 * The color violations that already existed when the token file was introduced and
 * that the sweep subtasks are working through. Locking the list rather than skipping
 * the check means enforcement starts now: a new duplicated color fails CI today, and
 * the list can only shrink. After removing some, run `yarn generate:theme-baseline`
 * and check the counts went down.
 *
 * Each entry identifies the declaration the literal was written in, not just the file
 * and the literal -- see `occurrence` in src/test/cssColors.ts for why.
 */
const baseline = (): {duplicates: string[], unknown: string[]} =>
  JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

/**
 * Splits a ratchet failure into its two directions, so the diff names the occurrences
 * that changed instead of printing two long sorted arrays side by side and leaving the
 * reader to find the delta in them.
 *
 * Both directions fail, because both mean the baseline no longer describes the tree:
 *
 * - `added` is the one that should block. Either you hardcoded a color that has a
 *   token, or you merged main and picked up stylesheets written before this check
 *   existed. Read the entries: if they name files your branch never touched, they are
 *   the second case and regenerating is the right call.
 * - `removed` means violations were fixed and the baseline needs to tighten around
 *   what is left, or the ratchet would leave room for them to come back.
 *
 * Either way the fix is `yarn generate:theme-baseline`; what differs is whether you
 * should be reaching for it or for a token.
 *
 * Compares as multisets rather than sets, because an occurrence key is not unique: one
 * declaration can write the same literal twice (`background: #fff` under a selector
 * that repeats a property for vendor-prefixed pseudo-elements), and the baseline holds
 * such a key once per occurrence. Set membership would call 2 -> 1 no change and let a
 * fixed violation come back for free -- which is the blind spot `occurrence` in
 * src/test/cssColors.ts already narrows deliberately, so it should not be widened here.
 */
const ratchet = (found: string[], locked: string[]) => {
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

  return {added, removed: removed.sort()};
};

const noDrift = {added: [], removed: []};

describe('theme.css', () => {
  it('is exactly what the generator produces from the JS theme', () => {
    // One equality rather than several assertions, so a missing token, an orphan token
    // and a stale value all fail the same way. Run `yarn generate:theme-css`.
    expect(fs.readFileSync(themeCssPath, 'utf8')).toEqual(themeCss());
  });

  it('resolves every color token to real channels', () => {
    // Guards the index the audit is built on: a token whose value cannot be resolved
    // would silently drop out of it and then be reported as unrecognised everywhere.
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
    expect(ratchet(colorViolations(srcDir).duplicates, baseline().duplicates)).toEqual(noDrift);
  });

  it('do not introduce an unrecognised color beyond the baseline', () => {
    expect(ratchet(colorViolations(srcDir).unknown, baseline().unknown)).toEqual(noDrift);
  });

  it('do not read a global token that does not exist', () => {
    // Catches a typo in a --color-*/--z-index-*/--padding-* reference, which would
    // otherwise fall through to its fallback, or to nothing, silently. It also keeps
    // component-local variables out of the global families' namespace.
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
    // @media (min-width: var(--x)) is not valid CSS, so breakpoint values stay
    // duplicated -- 75em appears well over a hundred times. Banning component-specific
    // breakpoints outright would be wrong (Footer legitimately uses 37.5em, 60.1em and
    // 90em), so this catches the failure the duplication actually causes instead: a
    // value meant to be a theme breakpoint but mistyped, e.g. 74em or 75.5em, which
    // silently stops matching where the theme's own queries match. The bound is
    // inclusive so that 74em -- exactly 1em out, and the likeliest typo -- is caught.
    const themeBreaks = [
      theme.breakpoints.mobileSmallBreak,
      theme.breakpoints.mobileMediumBreak,
      theme.breakpoints.mobileBreak,
    ];
    // the desktop side of a max-width query is the theme value + 0.0625, per desktopBreak
    const exact = new Set(themeBreaks.reduce(
      (result: number[], size) => [...result, size, size + 0.0625],
      []
    ));

    const suspicious: string[] = [];

    for (const file of stylesheetFiles(srcDir)) {
      const queries = stripNoise(fs.readFileSync(file, 'utf8'))
        .match(/\((?:min|max)-width:\s*[\d.]+em\)/g) || [];

      queries
        .map((query) => ({
          query,
          size: parseFloat((/([\d.]+)em/.exec(query) as RegExpExecArray)[1]),
        }))
        .filter(({size}) => !exact.has(size))
        .filter(({size}) => themeBreaks.some((themeBreak) => Math.abs(themeBreak - size) <= 1))
        .forEach(({query}) => suspicious.push(`${relative(file)}: ${query}`));
    }

    expect(suspicious).toEqual([]);
  });
});
