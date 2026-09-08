import * as fs from 'fs';
import * as path from 'path';

/*
 * The styled-components migration (CORE-1685) is finished as far as rex-web's own code
 * goes, but the package cannot be uninstalled yet: @openstax/ui-components declares it
 * as a peer dependency and we render Footer, NavBar and ConfirmationToast from that
 * library. See CORE-1777 / CORE-2286.
 *
 * That leaves styled-components resolvable from every file in the repo for as long as
 * ui-components takes to migrate, with nothing stopping a new import from appearing.
 * This test is the thing that stops it. When ui-components ships a styled-components-free
 * release, the allowlist below goes to empty, the package comes out of package.json, and
 * this file can be deleted along with it.
 */
const allowedImporters = new Set([
  // Collects the CSS that ui-components' styled components emit during prerendering, so
  // the prerendered markup ships with the styles for the class names it references.
  // Remove once ui-components no longer uses styled-components.
  'script/prerender/contentPages.tsx',
]);

/*
 * The whole repo, not just src: script/entry.js, src/setupProxy.js and craco.config.js
 * are all executable, and a require() in one of those reintroduces the dependency just as
 * effectively as an import in a component. Extensions are the ones jest resolves (see
 * moduleFileExtensions in package.json) plus the module variants webpack resolves.
 */
const searchRoot = '.';
const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const skipDirectories = new Set(['.git', 'node_modules', 'build', 'coverage']);

/*
 * Matches every way the package or one of its subpaths (the /macro entry being the one we
 * used to use) can be pulled in: a static import or re-export (from ...), a side-effect
 * import, a dynamic import, and a require. The quote has to sit directly against the
 * package name, so jest-styled-components in src/test/setup.ts is not a match.
 *
 * Deliberately written not to match itself, so that this file does not show up in its own
 * results -- which is why the package name never appears quoted in these comments.
 */
const importPattern = /(?:\bfrom\s*|\bimport\s*\(|\bimport\s+|\brequire\s*\()['"]styled-components(?:\/[^'"]*)?['"]/;

const repoRoot = path.resolve(__dirname, '..');

/*
 * Relative paths are joined with '/' rather than path.join so that they compare against
 * the allowlist on Windows too; path.join resolves them against the repo root either way.
 */
const findSourceFiles = (directory: string): string[] => fs
  .readdirSync(path.join(repoRoot, directory), {withFileTypes: true})
  .reduce<string[]>((found, entry) => {
    const relativePath = directory === '.' ? entry.name : `${directory}/${entry.name}`;

    if (entry.isDirectory()) {
      return skipDirectories.has(entry.name) ? found : found.concat(findSourceFiles(relativePath));
    }

    return sourceExtensions.indexOf(path.extname(entry.name)) === -1 ? found : found.concat(relativePath);
  }, []);

describe('styled-components', () => {
  it('is imported only by the files that still need it', () => {
    const importers = findSourceFiles(searchRoot)
      .filter((relativePath) => importPattern.test(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')));

    expect(importers.sort()).toEqual(Array.from(allowedImporters).sort());
  });
});
