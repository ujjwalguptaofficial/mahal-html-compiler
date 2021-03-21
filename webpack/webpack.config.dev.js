const baseConfig = require('./webpack.config.base');
const { merge } = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

module.exports = merge(baseConfig, {
    output: {
        filename: 'compiler.js',
        path: path.resolve(process.cwd(), 'dist/'),
        library: 'mahalHtmlCompiler',
        libraryTarget: "var"
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': "'development'",
        })
    ]
})