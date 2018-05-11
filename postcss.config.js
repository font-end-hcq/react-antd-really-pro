module.exports = {
    plugins: [
        require('autoprefixer')({
        	browsers:'>0.1%'
        }),
        require('cssnano')({zindex: false, reduceIdents: false})
    ]
}
