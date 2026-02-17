const path = require('path');
const webpack = require('webpack');
// https://gist.github.com/vimcaw/2056dbc92ec7a8cc8fdcec0c513ed45c
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    webpack: {
      alias: {
        // Webpack 5 (react-scripts 5.x) supports the `exports` field in package.json natively
        // so we no longer need this alias
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

                const htmlWebpackPluginInstance = webpackConfig.plugins.find(
                  webpackPlugin => webpackPlugin instanceof HtmlWebpackPlugin
                );
                if (htmlWebpackPluginInstance) {
                  htmlWebpackPluginInstance.options.scriptLoading = 'defer';
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
