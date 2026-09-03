/**
 * Rewrites src/app/theme.baseline.json from the current stylesheets.
 *
 * The baseline records the color violations that predate the token file, so that
 * src/app/theme.spec.ts can fail on *new* ones while the sweep works through the old
 * ones. Run this after removing violations — the counts it prints should go down, never
 * up. If they go up, you have added a hardcoded color that belongs in a token.
 */
import fs from 'fs';
import path from 'path';
import { colorViolations } from '../src/test/cssColors';

const srcDir = path.join(__dirname, '..', 'src');
const target = path.join(srcDir, 'app', 'theme.baseline.json');
const violations = colorViolations(srcDir);

fs.writeFileSync(target, `${JSON.stringify(violations, null, 2)}\n`);

// eslint-disable-next-line no-console
console.log(
  `wrote ${path.relative(process.cwd(), target)}: `
  + `${violations.duplicates.length} duplicates, ${violations.unknown.length} unrecognised`
);
