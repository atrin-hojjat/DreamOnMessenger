var path = require('path');

module.exports = {
    entry: {
        // popper : '/node_modules/popper.js/dist/poppper.min.js',
        // bootstrap : '/node_modules/bootstrap/dist/bootstrap.min.js',
        // index : '../front/index.js'
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../front/')
    }
};