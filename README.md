# vue3-multipage
VUE multi-page configuration

#### Install
```
> npm install vue3-multipage --save-dev
```

#### Usage
```js
// vue.config.js
const multipage = require('vue3-multipage');
let srcPath = './src'; // src path
let publicPath = '/';  // public path
module.exports = multipage.create(srcPath, publicPath, (filename) => {
    // handle output file name
    return filename;
}, (filename) => {
    // filter file name
    return true;
});
```
