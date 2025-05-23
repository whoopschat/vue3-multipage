const fs = require('fs');
const path = require('path');

try {
  const nativeSetImmediate = global.setImmediate
  global.setImmediate = (...args) => {
    // DO NOT REMOVE THIS 👇 
    // native code
    return nativeSetImmediate(...args)
  }
} catch (e) {
}

function _getFileName(file) {
  let dir = path.dirname(file);
  let info = path.parse(file);
  let name = info.name;
  while (dir && dir != '.') {
    info = path.parse(dir);
    name = info.name + '-' + name
    dir = path.dirname(dir);
  }
  return name;
}

function _getEntryList(src_path, path_handle, path_filter) {
  let entrys_list = [];
  const recursion = (recursion_path) => {
    if (!fs.existsSync(recursion_path)) {
      return;
    }
    const fileList = fs.readdirSync(recursion_path);
    if (!fileList.length) {
      return;
    }
    fileList.forEach(file => {
      let template = path.join(recursion_path, `./${file}`);
      let fileStat = fs.statSync(template);
      if (fileStat.isDirectory()) {
        return recursion(template);
      }
      let faviconIco = path.join(recursion_path, `./favicon.ico`);
      if (!fs.existsSync(faviconIco)) {
        faviconIco = undefined;
      }
      let faviconSvg = path.join(recursion_path, `./favicon.svg`);
      if (!fs.existsSync(faviconSvg)) {
        faviconSvg = undefined;
      }
      let entry = `${template.substring(0, template.lastIndexOf('.'))}.js`;
      if (/\.html$/.test(file) && fileStat.isFile() && fs.existsSync(entry)) {
        let title = _getFileName(path.relative(src_path, entry));
        if (path_handle && typeof path_handle == 'function') {
          let new_path = path_handle(title);
          if (new_path) {
            title = new_path;
          }
        }
        if (path_filter && typeof path_filter == 'function') {
          if (!path_filter(title)) {
            return;
          }
        }
        let filename = `${title}.html`
        let chunks = ['vendor', 'chunk-vendors', 'chunk-common', title];
        let favicon = faviconIco || faviconSvg;
        entrys_list.push({
          title,
          entry,
          template,
          filename,
          favicon,
          chunks,
        });
      }
    });
  }
  recursion(src_path);
  return entrys_list;
}

function _getPages(src_path, path_handle, path_filter) {
  let entrys = _getEntryList(src_path, path_handle, path_filter);
  let pages = {};
  entrys.forEach((entry) => {
    pages[entry.title] = Object.assign({}, entry);
  });
  return pages;
}

function create(src_path, publish_path, path_handle, path_filter, options = {}) {
  return Object.assign({
    publicPath: publish_path || './',
    pages: _getPages(path.join(process.cwd(), src_path || './src'), path_handle, path_filter)
  }, options)
}

exports = module.exports = {
  create
}


