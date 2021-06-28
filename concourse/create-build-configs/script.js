#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');

const versionFile = 'rex-web/.git/ref';
const booksFile = 'rex-web/src/config.books.json';
const envFile = 'build-configs/config.env';
const commitFile = 'build-configs/commit.txt';
const releaseFile = 'build-configs/release-id.txt';
const booksConfigFile = 'build-configs/books.json';

const handleErr = err => {
  if (!err) return;
  console.error(`Error: ${err}`);
  process.exit(1);
};

const readFile = (path) => new Promise(resolve => fs.readFile(path, 'utf8', (err, contents) => err ? handleErr(err) : resolve(contents)));

Promise.all([
  readFile(versionFile),
  readFile(booksFile)
]).then(input => {
  const [commit, books] = input.map(param => param.replace(/\s/g, ''));
  const versionInfoString = [commit, books].join('|');
  const version = crypto.createHash('sha1').update(versionInfoString).digest('hex')

  // the v4 gives an easy way to detect very old releases, this
  // is the fourth time i've changed the release id format:
  //  - initially `master/${commit}` became wrong when we started building from non-master places
  //  - `${date}/${commit}` had some nice aspects but creates duplicate releases in the new system
  //    where the pipeline can be triggered by non-rex changes
  //  - v3 is arbitrary but now it will be easy to check for the older releases and delete them (uses the rex code version)
  //  - v4 now hashes the code version and books config into a new version identifier
  const releaseId = `v4/${version.substring(0, 7)}`;
  const args = {
    BOOKS: books,
    REACT_APP_CODE_VERSION: commit,
    PUBLIC_URL: `/rex/releases/${releaseId}`,
    REACT_APP_RELEASE_ID: releaseId,
    REACT_APP_ENV: 'production',
  };

  console.log('Generating env file...');
  fs.writeFile(
    envFile,
    Object.entries(args).reduce((result, [key, value]) => [...result, `${key}="${value.replace(/"/g, '\\"')}"`], []).join("\n"),
    handleErr
  );

  console.log(`Generating commit file with: ${commit}`);
  fs.writeFile(commitFile, commit, handleErr);

  console.log(`Generating release id file with: ${releaseId}`);
  fs.writeFile(releaseFile, releaseId, handleErr);

  console.log(`Generating books file...`);
  fs.writeFile(booksConfigFile, books, handleErr);
});
