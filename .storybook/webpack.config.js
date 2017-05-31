
const path = require('path')

module.exports = function(storybookBaseConfig, configType) {
    // configType has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.
    
    // Make whatever fine-grained changes you need
    storybookBaseConfig.module.rules.push({
        test: /\.p?css/,
        loaders: ["style-loader", "css-loader", "postcss-loader"],
        include: path.resolve(__dirname, '../')
    })
    
    // Return the altered config
    return storybookBaseConfig
}