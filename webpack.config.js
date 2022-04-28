const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const isDev = process.env.NODE_ENV !== 'production';

const config = {
    mode: isDev ? 'development' : 'production',
    entry: './src/scripts/app.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
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
            { from: 'src/scripts/Levels/**/*.json'},
            { from: 'src/scripts/Levels/**/*.png', to: 'images/'},
            { from: 'src/css/style.css', to: 'css/' },
//           player idle textures
            { from: 'src/images/idle_01.png', to: 'images/' },
//           player dash textures
            { from: 'src/images/dash_01.png', to: 'images/' },
            { from: 'src/images/dash_02.png', to: 'images/' },
            { from: 'src/images/dash_03.png', to: 'images/' },
            { from: 'src/images/dash_04.png', to: 'images/' },
            { from: 'src/images/dash_05.png', to: 'images/' },
//           player run textures
            { from: 'src/images/run_01.png', to: 'images/' },
            { from: 'src/images/run_02.png', to: 'images/' },
//           player idle textures
            { from: 'src/images/wallSlide_01.png', to: 'images/' },
            { from: 'src/images/wallSlide_02.png', to: 'images/' },
            { from: 'src/images/wallSlide_03.png', to: 'images/' },

            { from: 'src/images/brokenTexture_01.png', to: 'images/' },
            { from: 'src/images/brokenTexture_02.png', to: 'images/' },
            { from: 'src/images/brokenTexture_03.png', to: 'images/' },
            { from: 'src/images/brokenTexture_04.png', to: 'images/' },
            { from: 'src/images/brokenTexture_05.png', to: 'images/' },

            { from: 'src/images/fall_01.png', to: 'images/' },

            { from: 'src/images/jump_01.png', to: 'images/' },

            { from: 'src/images/death_01.png', to: 'images/' },
            { from: 'src/images/death_02.png', to: 'images/' },
            { from: 'src/images/death_03.png', to: 'images/' },
            { from: 'src/images/death_04.png', to: 'images/' },
            { from: 'src/images/death_05.png', to: 'images/' },

            { from: 'src/audio/windowsError.mp3', to: 'audio/' },


            { from: 'src/scripts/Levels/boss-1/stagAttack.png', to: 'images/' },
            { from: 'src/scripts/Levels/labCave-1/wallJumpIcon.png', to: 'images/' },
            { from: 'src/images/spritesheet-1.json', to: 'images/' },
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