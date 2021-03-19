const path = require('path');
const nodeExternals = require('webpack-node-externals');
const SmartBannerPlugin = require('smart-banner-webpack-plugin');
const banner = require('../build_helper/license');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, '../src/index.ts'),
    devtool: 'source-map',
    // target: "node",
    mode: "development",
    module: {
        rules: [{
            test: /\.ts?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new SmartBannerPlugin(banner),
        new CopyPlugin({
            patterns: [
                { from: 'build_helper', to: '' },
            ],
        }),
    ],
    externals: [nodeExternals()]
};