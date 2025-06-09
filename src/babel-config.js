module.exports = function(additionalExtensions = ['.ts', '.tsx']) {
  const fetch = require('node-fetch');

  // lots of stuff relies on this
  const JSDOM = require('jsdom').JSDOM;
  global.DOMParser = new JSDOM().window.DOMParser;

  const URL = require('url');
  global.URL = URL.URL;
  global.fetch = fetch;

  require('@babel/register')({
    ignore: [/node_modules/],
    extensions: ['.js', '.jsx', ...additionalExtensions],
    presets: [
      '@babel/preset-env',
      '@babel/preset-typescript',
      '@babel/preset-react',
    ],
    plugins: [
      'macros',
      '@babel/transform-runtime',
    ]
  });
};
