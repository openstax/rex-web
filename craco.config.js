const path = require('path');
const webpack = require('webpack');

module.exports = {
    webpack: {
      alias: {
        // ts-utils uses the `exports` package.json options, which is not supported in webpack 4
        // this can be removed if we update react-scripts
        '@openstax/ts-utils': '@openstax/ts-utils/dist'
      },
    },
    plugins: [{
        plugin: {
            // Based on https://github.com/kevinsperrine/craco-workbox/blob/master/lib/index.js
            overrideWebpackConfig: ({ webpackConfig, context: { env, paths } }) => {
                if (env === "production") {
                  try {
                    const workboxConfig = require(path.join(
                      paths.appPath,
                      "workbox.config.js"
                    ));

                    webpackConfig.plugins.forEach(plugin => {
                      if (plugin.constructor.name === "InjectManifest") {
                        plugin.config = workboxConfig(plugin.config);
                      }
                    });
                  } catch (error) {
                    console.log("[craco.config.js - overrideWebpackConfig]");
                    console.log(error.stack);
                    process.exit(1);
                  }
                }

                return webpackConfig;
              }
        },
    }],
    style: {
        css: {
            loaderOptions: {
                // https://github.com/openstax/unified/issues/1469
                url: false,
            },
        },
    },
};
