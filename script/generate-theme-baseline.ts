/**
 * Rewrites src/app/theme.baseline.json from the current stylesheets.
 *
 * The baseline records the color violations that predate the token file, so that
 * src/app/theme.spec.ts can fail on *new* ones while the sweep works through the old
 * ones. Run this after removing violations — the counts it prints should go down.
 *
 * The one legitimate reason for them to go up is merging main: the plain-CSS migration
 * is landing stylesheets faster than the sweep is clearing them, and until this check
 * is on main those arrive unenforced. That is still a snapshot of pre-existing
 * violations, just taken later. Before regenerating, read the entries the spec reports
 * as added — if they are in files your branch touched, they are yours, and they want a
 * token rather than a line in here.
 */
import fs from 'fs';
import path from 'path';
import { colorViolations } from '../src/test/cssColors';

const srcDir = path.join(__dirname, '..', 'src');
const target = path.join(srcDir, 'app', 'theme.baseline.json');
const violations = colorViolations(srcDir);

// The two identity lists only. `violations.tokens` is which theme tokens happen to
// carry each color, which the spec recomputes when it needs to name them -- it is a
// fact about the theme rather than about the tree being locked, so writing it here
// would churn the baseline on token renames.
const {duplicates, unknown} = violations;

fs.writeFileSync(target, `${JSON.stringify({duplicates, unknown}, null, 2)}\n`);

// eslint-disable-next-line no-console
console.log(
  `wrote ${path.relative(process.cwd(), target)}: `
  + `${violations.duplicates.length} duplicates, ${violations.unknown.length} unrecognised`
);
