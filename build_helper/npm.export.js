if (process.env.NODE_ENV === 'test') {
    module.exports = require('./compiler.test.js');
}
else {
    module.exports = require('./compiler.js');
}
