const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: path.resolve(__dirname, 'src/index.ts'),
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
        filename: 'template_compiler.js',
        path: path.resolve(process.cwd(), 'src/'),
        library: 'tajHtmlCompiler',
        libraryTarget: "commonjs2"
    },
    plugins: [

    ],
    externals: [nodeExternals()]
};