// https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.InjectManifest
module.exports = options => {
  options.swDest = './books/service-worker.js';
  return options;
};
