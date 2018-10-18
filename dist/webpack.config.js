const path = require('path');
module.exports = {
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    target: 'es6',
    // node: {
    //   console: true,
    //   // __dirname: true,
    // },
    context: __dirname,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
//# sourceMappingURL=webpack.config.js.map