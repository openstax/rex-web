#!/usr/bin/env node

const fs = require('fs');
const versionFile = 'rex-web/.git/ref';
const booksFile = 'rex-web/src/config.books.json';
const envFile = 'build-configs/config.env';
const argFile = 'build-configs/config.json';
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
]).then(([commit, books]) => {
  // the v3 gives an easy way to detect very old releases, this
  // is the third time i've changed the release id format:
  //  - initially `master/${commit}` became wrong when we started building from non-master places
  //  - `${date}/${commit}` had some nice aspects but creates duplicate releases in the new system
  //    where the pipeline can be triggered by non-rex changes
  //  - v3 is arbitrary but now it will be easy to check for the older releases and delete them
  const releaseId = `v3/${commit.substring(0, 7)}`;
  const args = {
    PUBLIC_URL: `/rex/releases/${releaseId}`,
    REACT_APP_CODE_VERSION: commit,
    REACT_APP_RELEASE_ID: releaseId,
    REACT_APP_ENV: 'production',
    BOOKS: JSON.stringify(books)
  };

  console.log(JSON.stringify(args, null, 2));
  console.log('Generating env file...');
  fs.writeFile(
    envFile,
    Object.entries(args).reduce((result, [key, value]) => [...result, `${key}=${value}`], []).join("\n"),
    handleErr
  );

  console.log('Generating build arg file...');
  fs.writeFile(argFile, JSON.stringify(args), handleErr);

  console.log(`Generating commit file with: ${commit}`);
  fs.writeFile(commitFile, commit, handleErr);

  console.log(`Generating release id file with: ${releaseId}`);
  fs.writeFile(releaseFile, releaseId, handleErr);

  console.log(`Generating books file...`);
  fs.writeFile(booksConfigFile, JSON.stringify(books), handleErr);
});
