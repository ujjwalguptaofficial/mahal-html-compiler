const baseConfig = require('./webpack.config.base');
const { merge } = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

module.exports = merge(baseConfig, {
    output: {
        filename: 'compiler.test.js',
        path: path.resolve(process.cwd(), 'dist/'),
        library: 'mahalHtmlCompiler',
        libraryTarget: "commonjs2"
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': "'test'",
        })
    ]
})