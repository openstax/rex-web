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

const searchRoots = ['src', 'script'];
const sourceExtensions = ['.ts', '.tsx'];
const skipDirectories = new Set(['node_modules', 'build', 'coverage']);

/*
 * Matches an import or a require of the package or any of its subpaths (the /macro entry
 * being the one we used to use). Deliberately written not to match itself, so that this
 * file does not show up in its own results.
 */
const importPattern = /(?:from|require\()\s*['"]styled-components(?:\/[^'"]*)?['"]/;

const repoRoot = path.resolve(__dirname, '..');

const findSourceFiles = (directory: string): string[] => fs
  .readdirSync(path.join(repoRoot, directory), {withFileTypes: true})
  .reduce<string[]>((found, entry) => {
    const relativePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return skipDirectories.has(entry.name) ? found : found.concat(findSourceFiles(relativePath));
    }

    return sourceExtensions.indexOf(path.extname(entry.name)) === -1 ? found : found.concat(relativePath);
  }, []);

describe('styled-components', () => {
  it('is imported only by the files that still need it', () => {
    const importers = searchRoots
      .reduce<string[]>((found, root) => found.concat(findSourceFiles(root)), [])
      .filter((relativePath) => importPattern.test(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')));

    expect(importers.sort()).toEqual(Array.from(allowedImporters).sort());
  });
});
