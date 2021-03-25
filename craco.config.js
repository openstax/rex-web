const { APP_ENV } = require('./src/config');

// We are using `yarn start` -> `react-scripts start` in `jest-puppeteer.config.js` to run test server
// for browserspecs. react-scripts are using `webpack-dev-server` which does not have an option to disable
// file watching (only `webpack` has this option) https://github.com/webpack/webpack-dev-server/issues/1744#issuecomment-477339500
// We want to disable file watching because files are being added to Inotify which raises an error when running in Github CI.
// https://github.com/openstax/rex-web/pull/1118#issuecomment-797573574
module.exports = {
  devServer: {
    watchOptions: {
      ignored: APP_ENV === 'test' ? /\.tsx/ : undefined,
    }
  },
};
