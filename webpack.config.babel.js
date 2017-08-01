/**
 * Module dependencies.
 * @private
 */
import path from 'path';
import webpack from 'webpack';
import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';
import HtmlPlugin from 'html-webpack-plugin';
import ExtractText from 'extract-text-webpack-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import config from './package.json';

/**
 * Environment constants.
 * @private
 */
const ENV_DEV = 'dev';
const ENV_PROD = 'prod';

/**
 * Module constants.
 * @private
 */
const env = process.argv.indexOf('-p') === -1 ? ENV_DEV : ENV_PROD;
const srcDir = path.resolve(__dirname, 'src');
const distDir = path.resolve(__dirname, 'dist');
const extractLess = new ExtractText({filename: 'assets/[name].css'});

/**
 * Pages.
 * @type {[*]}
 * @constant
 * @private
 */
const pages = [{
    title: [config.name, 'version', config.version].join(' '),
    filename: 'index.html',
    template: 'templates/index.ejs',
    favicon: 'styles/favicon.ico',
    styles: ['assets/index.css'],
    scripts: ['assets/index.js']
}];

/**
 * Minify HTML configuration
 * @type {Object}
 * @constant
 * @private
 */
const minifyHtmlOptions = {
    collapseWhitespace: true,
    html5: true
};

/**
 * Production plugins
 * @type {Array}
 * @constant
 * @private
 */
const prodPlugins = [
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            drop_console: true,
            unsafe: true
        }
    }),
    new OptimizeCssAssetsPlugin({
        assetNameRegExp: /.*\.css$/g,
        cssProcessor: cssnano,
        cssProcessorOptions: {discardComments: {removeAll: true}},
        canPrint: true
    })
];

/**
 * Webpack configuration
 * @module WebpackConfigBabel
 */
export default {
    devtool: env === ENV_DEV ? 'source-map' : false,
    context: srcDir,
    entry: {
        app: './index.js'
    },
    output: {
        filename: 'assets/[name].js',
        path: distDir,
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                exclude: /node_modules/,
                use: extractLess.extract({
                    use: [
                        {loader: 'css-loader'},
                        {loader: 'less-loader'}
                    ],
                    fallback: 'style-loader'
                })
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader'
                ]
            },
            {
                test: /\.(png|jpg|svg|ttf|eot|woff|woff2)$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: 'assets/[hash:8].[ext]'
                    }
                }]
            }
        ]
    },
    plugins: [
        ...pages.map(page => new HtmlPlugin({
            ...page,
            minify: env === ENV_PROD ? minifyHtmlOptions : false,
            inject: false
        })),
        extractLess,
        autoprefixer,
        ...(env === ENV_PROD ? prodPlugins : [])
    ],
    resolve: {
        extensions: ['.js', '.json']
    }
};
