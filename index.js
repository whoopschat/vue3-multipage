const fs = require('fs');
const path = require('path');

function _getFileName(file, path_mode) {
    let dir = path.dirname(file);
    let info = path.parse(file);
    let name = info.name;
    while (dir && dir != '.') {
        info = path.parse(dir);
        name = info.name + (path_mode || process.env.PATH_MODE || '-') + name
        dir = path.dirname(dir);
    }
    return name;
}

function _getEntryList(src_path, path_mode) {
    let entrys_list = [];
    const recursion = (recursion_path) => {
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
            let entry = `${template.substr(0, template.lastIndexOf('.'))}.js`;
            let filename = `${_getFileName(path.relative(src_path, template), path_mode)}.html`;
            if (/\.html$/.test(file) && fileStat.isFile() && fs.existsSync(entry)) {
                let title = _getFileName(path.relative(src_path, entry), path_mode);
                let chunks = ['vendor', 'chunk-vendors', 'chunk-common', title];
                entrys_list.push({
                    title,
                    entry,
                    template,
                    filename,
                    chunks,
                });
            }
        });
    }
    recursion(src_path);
    return entrys_list;
}

function _getPages(src_path, path_mode) {
    let entrys = _getEntryList(src_path, path_mode);
    let pages = {};
    entrys.forEach((entry) => {
        pages[entry.title] = Object.assign({}, entry);
    });
    return pages;
}

function create(src_path, publish_path, path_mode) {
    return {
        baseUrl: publish_path || process.env.PUBLIC_PATH || './',
        pages: _getPages(path.join(process.cwd(), src_path || process.env.SRC_PATH || './src'), path_mode)
    }
}

exports = module.exports = {
    create
}


