/* tslint:disable */

const fs = require('fs');
const path = require('path');
const tsImportPluginFactory = require('ts-import-plugin')
const { getLoader, paths } = require("react-app-rewired");
const lessToJs = require('less-vars-to-js');
const _ = require('lodash');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// 多页应用入口文件数组
const pages = ['index', 'index-charon', 'index-venus'];

// 获取antd自定义主题设置
const antdThemer = lessToJs(fs.readFileSync(path.join(__dirname, './src/themes/antd-theme/index.less'), 'utf8'));

module.exports = (config, env) => {

  const tsLoader = getLoader(
    config.module.rules,
    rule =>
      rule.loader &&
      typeof rule.loader === 'string' &&
      rule.loader.includes('ts-loader')
  );

  // ts-import-plugin
  tsLoader.options = {
    getCustomTransformers: () => ({
      before: [tsImportPluginFactory({
        libraryDirectory: 'es',
        libraryName: 'antd',
        style: 'true',
      })]
    })
  };

  // 多页应用entry配置
  config.entry = ((entry) => {
    const entryPages = {};
    // 确认入口tsx在entry数组的位置
    const entryIndex = entry.indexOf(paths.appIndexJs);

    _.forEach(pages, i => {
      if (i === 'index') {
        entryPages[i] = entry;
      } else {
        const defaultEntry = _.cloneDeep(entry);
        defaultEntry[entryIndex] = paths.appSrc + `/${i}.tsx`;
        entryPages[i] = defaultEntry;
      }
    });

    return entryPages;
  })(config.entry);

  // 多页应用output配置
  if (env === 'development') { // 生产环境下默认已修改带hash的bundle.js
    config.output.filename = 'static/js/[name].bundle.js';
  }

  // less-module and customize-antd-theme
  config.module.rules[1].oneOf = ((rules) => {
    const addArr = ['less-module', 'customize-antd-theme' ];
    const newRules = _.cloneDeep(rules);
    _.forEach(addArr, i => {
      const opts = {
        test: /\.less$/,
        use: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
              minimize: true,
              // sourceMap: true,
            }
          },
          {
            loader: require.resolve('postcss-loader'),
            options: {
              ident: 'postcss',
              plugins: () => [
                require('postcss-flexbugs-fixes'),
                autoprefixer({
                  browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 9', // React doesn't support IE8 anyway
                  ],
                  flexbox: 'no-2009',
                })
              ]
            }
          },
          {
            loader: require.resolve('less-loader'),
            options: {
              javascriptEnabled: true
            }
          }
        ]
      };
      if (i === 'less-module') {
        opts.include = /\.module\.less/; // 需开启的less-module以.module结尾
        opts.exclude = /node_modules/;
        opts.use[1].options.modules = true;
        opts.use[1].options.localIdentName = '[local]__[hash:base64:5]';
      } else { // 'customize-antd-theme'
        opts.exclude = /\.module\.less/;
        opts.use[3].options.modifyVars = antdThemer;
      }
      newRules.unshift(opts);
    });

    return newRules;
  })(config.module.rules[1].oneOf);

  // 多页应用plugins配置
  config.plugins = ((plugins) => {
    // 确认HtmlWebpackPlugin在plugins数组的位置
    let htmlIndex;
    let j = plugins.length;
    while (j--) {
      if (plugins[j] instanceof HtmlWebpackPlugin) {
        htmlIndex = j;
        break;
      }
    }

    const newPlugins = _.cloneDeep(plugins);
    newPlugins.splice(htmlIndex, 1);
    _.forEach(pages, (i, index) => {
      const htmlOpts = _.cloneDeep(plugins[htmlIndex].options);
      htmlOpts.chunks = [i];
      htmlOpts.filename = `${i}.html`;
      newPlugins.splice(index + htmlIndex, 0, new HtmlWebpackPlugin(htmlOpts));
    });

    return newPlugins;
  })(config.plugins);

  return config;
}
