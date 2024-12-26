const path = require('path');
const CopyPlugin = require("copy-webpack-plugin")

const outputpath = 'out'
const mode = 'production'

const mainConfig = {
    entry: './src/app/index.ts',
    target: 'electron-main',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, outputpath),
        publicPath: "/"
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: path.join(__dirname, "src/client/assets/images/logo/fractalium.png"),
                    to: "assets"
                }
            ]
        })
    ],
    mode,
    node: {
        __dirname: false,
        __filename: false
    }
}

const preloadConfig = {
    entry: './src/preload.js',
    target: 'electron-preload',
    output: {
        filename: 'preload.js',
        path: path.resolve(__dirname, outputpath)
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    mode,
}

module.exports = [mainConfig, preloadConfig];