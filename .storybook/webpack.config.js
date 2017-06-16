
const path = require('path')

module.exports = {
    module: {
        rules: [{
            test: /\.pcss/,
            loaders: [{
                loader: "style-loader"
            }, {
                loader: "css-loader",
                options: {
                    modules: true
                }
            }, {
                loader: "postcss-loader"
            }],
            include: path.resolve(__dirname, '../')
        },{
            test: /\.css/,
            loaders: ["style-loader", "css-loader"],
            include: path.resolve(__dirname, '../')
        }]
    }
}