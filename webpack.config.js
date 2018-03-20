const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    context: path.resolve(__dirname, 'src'),
    entry: './browser.js',
    output: {
        filename: 'tagger.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'TGR',
        libraryTarget: 'umd'
    }
};
