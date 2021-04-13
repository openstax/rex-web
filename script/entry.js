const fs = require('fs');
const path = require('path');
const identity = require('lodash/fp/identity');
const script = process.argv[2];
const scriptPath = `./${script}`;
const extensions = ['.ts', '.tsx'];
const requireBabelConfig = require('../src/babel-config');

requireBabelConfig(extensions);

if (!script) {
  console.error('script argument is required');
  process.exit(1);
}

const exists = extensions
  .map(extension => fs.existsSync(path.resolve(__dirname, scriptPath + extension)))
  .filter(identity)
  .length > 0;

if (!exists) {
  console.error(`script "${script}" does not exist`);
  process.exit(1);
}

require(scriptPath);
