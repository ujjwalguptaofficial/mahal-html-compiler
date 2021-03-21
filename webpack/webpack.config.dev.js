const baseConfig = require('./webpack.config.base');
const { merge } = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const libraryTarget = [{
    type: "var",
    name: 'compiler.web.js'
}, {
    type: "commonjs2",
    name: 'compiler.js'
}];

function getConfigForTaget(target) {
    return {
        devtool: 'source-map',
        output: {
            filename: target.name,
            path: path.resolve(process.cwd(), 'dist/'),
            library: 'mahalHtmlCompiler',
            libraryTarget: target.type
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': "'development'",
            })
        ]
    }
}

function createConfigsForAllLibraryTarget() {
    var configs = [];
    libraryTarget.forEach(function (target) {
        configs.push(merge(baseConfig, getConfigForTaget(target)));
    })
    return configs;
}

module.exports = [...createConfigsForAllLibraryTarget()]