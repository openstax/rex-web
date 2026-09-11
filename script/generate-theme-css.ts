/**
 * Writes src/app/theme.css from the JS theme. Run via `yarn generate:theme-css`.
 * The projection itself lives in src/app/themeCss.ts so that it can be unit tested.
 */
import fs from 'fs';
import path from 'path';
import { themeCss } from '../src/app/themeCss';

const target = path.join(__dirname, '..', 'src', 'app', 'theme.css');

fs.writeFileSync(target, themeCss());

// eslint-disable-next-line no-console
console.log(`wrote ${path.relative(process.cwd(), target)}`);
