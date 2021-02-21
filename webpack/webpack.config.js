const path = require('path');
const nodeExternals = require('webpack-node-externals');
const SmartBannerPlugin = require('smart-banner-webpack-plugin');
const banner = require('../build_helper/license');

module.exports = {
    entry: path.resolve(__dirname, '../src/index.ts'),
    devtool: 'source-map',
    target: "node",
    mode: "development",
    module: {
        rules: [{
            test: /\.ts?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'compiler.js',
        path: path.resolve(process.cwd(), 'dist/'),
        library: 'mahalHtmlCompiler',
        libraryTarget: "commonjs2"
    },
    plugins: [
        new SmartBannerPlugin(banner),
    ],
    externals: [nodeExternals()]
};