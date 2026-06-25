const path = require('path');
const webpack = require('webpack');
// https://gist.github.com/vimcaw/2056dbc92ec7a8cc8fdcec0c513ed45c
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    webpack: {
      alias: {
        // ts-utils uses the `exports` package.json options, which is not supported in webpack 4
        // this can be removed if we update react-scripts
        '@openstax/ts-utils': '@openstax/ts-utils/dist/cjs'
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

                // dompurify 3.4.11 ships purify.js.map with null sourcesContent. babel chains
                // it into the bundle sourcemap via normalize-file.js line 67's inputSourceMap
                // check. Setting sourceMaps: false makes babel return [code, null], so webpack
                // uses OriginalSource (no TS entries) rather than SourceMapSource.
                const oneOfRules = webpackConfig.module.rules.find(rule => rule.oneOf).oneOf;
                const depsRuleIdx = oneOfRules.findIndex(
                  rule => rule.loader && rule.loader.includes('babel-loader') && !rule.include
                );
                if (depsRuleIdx >= 0) {
                  const depsRule = oneOfRules[depsRuleIdx];
                  oneOfRules.splice(depsRuleIdx, 0, {
                    test: /node_modules[\\/]dompurify[\\/]/,
                    loader: depsRule.loader,
                    options: Object.assign({}, depsRule.options, { sourceMaps: false }),
                  });
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
