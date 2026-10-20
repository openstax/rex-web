import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

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

const isStyledComponents = (specifier: string) =>
  specifier === 'styled-components' || specifier.startsWith('styled-components/');

/*
 * Every module a source file pulls in, found with TypeScript's scanner: static imports and
 * re-exports, side-effect imports, dynamic imports, and require calls. The scanner skips
 * comments, so a comment between the keyword and the specifier (a webpack magic comment, say)
 * cannot hide an import, and commented-out code is not a match. The subpath form (the /macro
 * entry we used to use) counts, and jest-styled-components does not.
 */
const importedModules = (source: string) =>
  ts.preProcessFile(source, true, true).importedFiles.map((file) => file.fileName);

const importsStyledComponents = (source: string) => importedModules(source).some(isStyledComponents);

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
      .filter((relativePath) => importsStyledComponents(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')));

    expect(importers.sort()).toEqual(Array.from(allowedImporters).sort());
  });
});

describe('finding styled-components imports', () => {
  const imports: Array<[string, string]> = [
    ['a default import', `import styled from 'styled-components'`],
    ['a named import of the macro entry', `import {css} from "styled-components/macro"`],
    ['a side-effect import', `import 'styled-components'`],
    ['a re-export', `export * from 'styled-components'`],
    ['a dynamic import', `import('styled-components')`],
    ['a dynamic import with a webpack magic comment', `import(/* webpackChunkName: "styles" */ 'styled-components')`],
    ['a side-effect import with a comment before the specifier', `import /* needed for prerender */ 'styled-components'`],
    ['a require', `const styled = require('styled-components')`],
    ['a require with a space before the parenthesis', `require ('styled-components')`],
    ['a require with a comment before the parenthesis', `require /* note */ ('styled-components')`],
    ['an import-equals require', `import styled = require('styled-components')`],
    ['an import after other code', `const a = 1;\nimport('styled-components/native');`],
  ];

  imports.forEach(([name, source]) => {
    it(`finds ${name}`, () => {
      expect(importsStyledComponents(source)).toBe(true);
    });
  });

  const notImports: Array<[string, string]> = [
    ['a line comment', `// import styled from 'styled-components'`],
    ['a block comment', `/* require('styled-components') */`],
    ['the name in a string', `const name = 'styled-components';`],
    ['jest-styled-components', `import 'jest-styled-components'`],
    ['a package that only starts with the name', `import x from 'styled-components-extras'`],
    ['an unrelated import', `import React from 'react'`],
  ];

  notImports.forEach(([name, source]) => {
    it(`does not match ${name}`, () => {
      expect(importsStyledComponents(source)).toBe(false);
    });
  });
});
