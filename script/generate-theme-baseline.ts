/**
 * Rewrites src/app/theme.baseline.json from the current stylesheets. See
 * PLAIN_CSS_MIGRATION_GUIDE.md, Pattern 2.5.
 *
 * Merging main can legitimately raise the counts, until this check is on main. If an
 * added entry is in a file your branch touched, it wants a token, not a baseline line.
 */
import fs from 'fs';
import path from 'path';
import { colorViolations } from '../src/test/themeColors';

const srcDir = path.join(__dirname, '..', 'src');
const target = path.join(srcDir, 'app', 'theme.baseline.json');
const violations = colorViolations(srcDir);

// `violations.tokens` is left out -- see ColorViolations.tokens.
const {duplicates, unknown} = violations;

fs.writeFileSync(target, `${JSON.stringify({duplicates, unknown}, null, 2)}\n`);

// eslint-disable-next-line no-console
console.log(
  `wrote ${path.relative(process.cwd(), target)}: `
  + `${violations.duplicates.length} duplicates, ${violations.unknown.length} unrecognised`
);
