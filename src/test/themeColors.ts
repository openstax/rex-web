/**
 * REX's side of the stylesheet color audit: which colors are theme values, which files
 * are checked, and how violations are reported. Shared by src/app/theme.spec.ts and
 * script/generate-theme-baseline.ts so both use the same logic. The CSS parsing comes
 * from @openstax/ui-components.
 */

import fs from 'fs';
import path from 'path';
import { themeTokens } from '../app/themeCss';
import {
  colorKey, describeColor, opaqueKey, StylesheetColor, stylesheetColors,
} from '@openstax/ui-components/theme/cssColors';

/**
 * Maps each color to every `--color-*` token with that value, shortest name first.
 * Several tokens can share a color (`#fff` has eleven), and only the author knows which
 * one a declaration means, so all of them are offered.
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

/** Deliberate off-palette colors, each keyed to the reason it is not a theme value. */
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
   * For each entry in `duplicates`, the tokens that could replace it. Kept out of the
   * baseline so that renaming a token does not change it.
   */
  tokens: {[entry: string]: string[]};
}

/**
 * How a color occurrence is identified in the baseline (see
 * PLAIN_CSS_MIGRATION_GUIDE.md, Pattern 2.5). Not a line number, which would churn the
 * baseline whenever an unrelated rule is inserted above one.
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
        const entry = occurrence(name, found);
        duplicates.push(entry);
        tokens[entry] = declaring;
        return;
      }

      // A translucent theme color, like rgba(0, 0, 0, 0.2), has no token, so it passes
      // on its opaque channels.
      const recognised = rgba !== null
        && (values[opaqueKey(rgba)] || KNOWN_OFF_PALETTE[colorKey(rgba)]);

      if (!recognised) {
        // includes colors the parser cannot resolve, such as hsl()
        unknown.push(occurrence(name, found));
      }
    });
  });

  return {duplicates: duplicates.sort(), unknown: unknown.sort(), tokens};
};
