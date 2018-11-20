/*
 * this file is largely copied from https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/env.js
 * for the benefit of consistent environment file names between web and pre-render
 */
const path = require('path');
const fs = require('fs');

const NODE_ENV = process.env.NODE_ENV;

const dotenv = path.resolve(fs.realpathSync(process.cwd()), '.env');

const dotenvFiles = [
  `${dotenv}.${NODE_ENV}.local`,
  `${dotenv}.${NODE_ENV}`,
  // Don't include `.env.local` for `test` environment
  // since normally you expect tests to produce the same
  // results for everyone
  NODE_ENV !== 'test' && `${dotenv}.local`,
  dotenv,
].filter(Boolean);

dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    require('dotenv-expand')(
      require('dotenv').config({
        path: dotenvFile,
      })
    );
  }
});
