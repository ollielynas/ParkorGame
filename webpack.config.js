const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const isDev = process.env.NODE_ENV !== 'production';

const config = {
    mode: isDev ? 'development' : 'production',
    entry: {
        app: './src/scripts/app.ts',
        editor: './src/scripts/editor.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    devtool: "source-map",

    performance : {
        hints : false
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin([
            { from: 'src/index.html' },
            { from: 'src/editor.html' },
            { from: 'src/scripts/Levels/**/*.json'},
            { from: 'src/scripts/Levels/**/*.png', to: 'images/'},
            { from: 'src/css/style.css', to: 'css/' },
//           player idle textures
            { from: 'src/**/*.png'},
            // { from: 'src/images/run_02.png', to: 'images/' },
//           player idle textures

            { from: 'src/audio/windowsError.mp3', to: 'audio/' },
            { from: 'src/audio/wallSide.mp3', to: 'audio/' },
            { from: 'src/audio/woosh.mp3', to: 'audio/' },
            { from: 'src/audio/footstep.mp3', to: 'audio/' },
            { from: 'src/audio/playerDeath.mp3', to: 'audio/' },


            { from: 'src/scripts/Levels/boss-1/stagAttack.png', to: 'images/' },
            { from: 'src/scripts/Levels/labCave-1/wallJumpIcon.png', to: 'images/' },
            { from: 'src/images/overworld-background.png', to: 'images/' },


        ]),
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 8080,
        hot: true
    },
    optimization: {
        minimize: !isDev
      }
};



module.exports = config;