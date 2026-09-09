/**
 * REX's color audit: the policy half, on top of the engine ui-components publishes.
 *
 * What counts as a theme value, which off-palette colors are tolerated, which files are
 * in scope and how a violation is worded are all REX's answers, and they stay here. The
 * parsing underneath them — declarations in, resolved color literals out — is not REX's
 * at all, and lives in @openstax/ui-components/theme/cssColors.
 *
 * It used to live here too. CORE-2731 hand-wrote a second copy of an engine that
 * already existed in ui-components, and the two had diverged before either merged: of
 * the four defects review found in this copy, one was REX-only and two were shared.
 * CORE-2736 published the engine so there is one copy to fix; this file is what is left
 * once it is imported rather than declared.
 *
 * Lives under src/test/ because it is test infrastructure rather than app code, so it
 * is outside jest's `collectCoverageFrom`. It has its own spec regardless: without one,
 * "CI enforces the palette" would be an assertion rather than a tested guarantee.
 */

import {
  colorKey,
  describeColor,
  opaqueKey,
  StylesheetColor,
  stylesheetColors,
} from '@openstax/ui-components/theme/cssColors';
import fs from 'fs';
import path from 'path';
import { themeTokens } from '../app/themeCss';

/**
 * Maps a canonical color key to every `--color-*` token that declares it.
 *
 * Every, not one. Ten of the theme's colors are carried by more than one token: `#fff`
 * by eleven (`--color-white`, `--color-text-white` and the nine `*-foreground` tokens
 * that happen to be white), `#424242` by six, `#000` by five. Keeping a single token
 * per key meant the last one in the projection won and got named as *the* replacement,
 * which is a guess presented as an instruction — and it was already guessing wrong:
 * every `#000` in the baseline was attributed to `--color-text-black`, including
 * `.nudge-click-blocker { background-color }`, a full-screen overlay, and
 * `.button-primary:focus { box-shadow }`. Both mean `--color-black`.
 *
 * Naming all of them puts the choice back with the author, who is the only one who
 * knows which meaning was intended. Same reasoning as generating theme.css from the JS
 * theme: where the code cannot know the answer, it should not invent one.
 *
 * Restricted to the `--color-*` family so that the suggestions can only ever be color
 * tokens. No `--z-index-*` or `--padding-*` value resolves as a color today, so this
 * is a no-op that pins the intent.
 *
 * Each list is ordered shortest name first, so `#fff` leads with `--color-white`
 * rather than burying it after nine `*-foreground` tokens as projection order did.
 * That is presentation, not a recommendation: the whole list is still shown, and a
 * shorter token name means a less qualified one, which is the likelier fit for a
 * declaration that just wants the color. Length then alphabetical, so it is stable.
 */
export const themeColorIndex = (): {[key: string]: string[]} => {
  const index: {[key: string]: string[]} = {};

  for (const [name, value] of themeTokens()) {
    if (!name.startsWith('color-')) { continue; }

    const rgba = describeColor(value);
    if (rgba === null) { continue; }

    const key = colorKey(rgba);
    index[key] = (index[key] || []).concat(`--${name}`);
  }

  for (const key of Object.keys(index)) {
    index[key].sort((a, b) => a.length - b.length || a.localeCompare(b));
  }

  return index;
};

/** `a`, `a or b`, `a, b or c` — for naming every token that carries one color. */
export const tokenChoices = (tokens: string[]): string => tokens.length < 2
  ? tokens.join('')
  : `${tokens.slice(0, -1).join(', ')} or ${tokens[tokens.length - 1]}`;

/**
 * Colors that are deliberately not theme values, so they are never reported as
 * unrecognised. Each entry needs a reason: a color only belongs here if snapping it
 * to the nearest palette entry would be a visual change, which is a design decision
 * rather than a refactor.
 */
export const KNOWN_OFF_PALETTE: {[key: string]: string} = {};

export const stylesheetFiles = (srcDir: string): string[] => {
  const walk = (dir: string, into: string[]): string[] => {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(target, into); }
      else if (entry.name.endsWith('.css')) { into.push(target); }
    }

    return into;
  };

  return walk(srcDir, [])
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
  /**
   * For each entry in `duplicates`, every token carrying that color — the replacements
   * the author gets to choose between.
   *
   * Kept out of the entry itself, and so out of the baseline, on purpose. An occurrence
   * is identified by where it was written; which tokens happen to share its value is a
   * fact about the theme, not about the declaration. Baking it in would rewrite every
   * affected baseline line whenever a token was renamed or a new one adopted an
   * existing value — churn for a reason that has nothing to do with the CSS, and a
   * baseline regenerated for an unrelated reason is exactly where a new color hides.
   */
  tokens: {[entry: string]: string[]};
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
  const tokens: {[entry: string]: string[]} = {};

  stylesheetFiles(srcDir).forEach((file) => {
    const name = path.relative(srcDir, file);

    stylesheetColors(fs.readFileSync(file, 'utf8')).forEach((found) => {
      const {rgba} = found;
      const declaring = rgba && values[colorKey(rgba)];

      if (declaring) {
        // an exact match is a duplicate. `rgba(0, 0, 0, 0.2)` is not: it is black at
        // 20% and has no token form, so it falls through to the check below and
        // passes there on its opaque channels.
        const entry = occurrence(name, found);
        duplicates.push(entry);
        tokens[entry] = declaring;
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

  return {duplicates: duplicates.sort(), unknown: unknown.sort(), tokens};
};
