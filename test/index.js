const multipage = require('../index');

let config = multipage.create("./test", "./", (filename) => {
    // handle output file name
    return filename;
}, (path) => {
    return true;
}, {
    // other config
});

console.log(config);