const imagemin = require( "imagemin" )
const webp = require( "imagemin-webp" )

imagemin( ['src/images/*.{jpg,png}'], {
    destination: 'src/images',
    plugins: [
        webp( { quality: 60 } )
    ]
} )