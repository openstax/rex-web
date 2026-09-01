/**
 * Projection from the JS theme data to CSS custom properties.
 *
 * `theme.css` is generated from this, not hand-written — run
 * `yarn generate:theme-css` after changing anything in `themeData.ts`.
 * `theme.spec.ts` asserts the committed file matches this output exactly, so a
 * missing token, an orphan token and a stale value all fail the same way.
 */
import { color, padding, zIndex } from './themeData';

const GENERATED_HEADER = [
  '/*',
  ' * GENERATED FILE — do not edit.',
  ' *',
  ' * Generated from src/app/themeData.ts by src/app/themeCss.ts.',
  ' * Run `yarn generate:theme-css` to regenerate; src/app/theme.spec.ts fails if',
  ' * this file and the JS theme disagree.',
  ' */',
].join('\n');

/**
 * Hex values are lowercased on the way out. The JS theme mixes cases (`#027EB5`
 * next to `#d4450c`) and CSS is case-insensitive here, so normalising means a
 * token's value has exactly one spelling and stylelint's color-hex-case is
 * satisfied without having to touch the published JS values.
 */
const normalizeValue = (value: string) =>
  /^#[0-9a-fA-F]{3,8}$/.test(value) ? value.toLowerCase() : value;

const kebabCase = (value: string) => value
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .toLowerCase();

/**
 * Flattens a nested record of strings into `[dashed-path, value]` pairs.
 * `{neutral: {formBorder: '#d5d5d5'}}` becomes `[['neutral-form-border', '#d5d5d5']]`.
 * Keys that are already kebab-case (`light-blue`) pass through unchanged.
 */
const flatten = (source: object, prefix: string[] = []): Array<[string, string]> =>
  Object.entries(source).reduce((result: Array<[string, string]>, [key, value]) => {
    const path = [...prefix, kebabCase(key)];

    return typeof value === 'object'
      ? [...result, ...flatten(value, path)]
      : [...result, [path.join('-'), normalizeValue(String(value))]];
  }, []);

/**
 * The tokens `theme.css` declares, in the order they are written.
 *
 * `--color-link` rather than `--color-link-base` is the one special case: the
 * bare name reads better at the call site and matches ui-components.
 */
export const themeTokens = (): Array<[string, string]> => [
  ...flatten(color, ['color']).map(([name, value]): [string, string] =>
    [name === 'color-link-base' ? 'color-link' : name, value]),
  ...flatten(zIndex, ['z-index']),
  ...flatten(padding, ['padding']).map(([name, value]): [string, string] =>
    [name, `${value}rem`]),
];

export const themeCss = () => [
  GENERATED_HEADER,
  '',
  ':root {',
  ...themeTokens().map(([name, value]) => `  --${name}: ${value};`),
  '}',
  '',
].join('\n');
