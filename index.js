const fs = require('fs');
const path = require('path');

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

function _getEntryList(srcPath) {
    let entrysList = [];
    const recursionFile = (nextPath) => {
        const fileList = fs.readdirSync(nextPath);
        if (!fileList.length) {
            return;
        }
        fileList.forEach(file => {
            let template = path.join(nextPath, `./${file}`);
            let entry = `${template.substr(0, template.lastIndexOf('.'))}.js`;
            let filename = path.relative(srcPath, template);
            let fileStat = fs.statSync(template);
            if (fileStat.isDirectory()) {
                return recursionFile(template);
            }
            if (/\.html$/.test(file) && fileStat.isFile() && fs.existsSync(entry)) {
                let title = _getFileName(path.relative(srcPath, entry));
                let chunks = ['vendor', 'chunk-vendors', 'chunk-common', title];
                entrysList.push({
                    title,
                    entry,
                    template,
                    filename,
                    chunks,
                });
            }
        });
    }
    recursionFile(srcPath);
    return entrysList;
}

function _getPages(srcPath) {
    let entrys = _getEntryList(srcPath);
    let pages = {};
    entrys.forEach((entry) => {
        pages[entry.title] = Object.assign({}, entry);
    });
    return pages;
}

exports.create = function (srcPath, baseUrl) {
    return {
        baseUrl: baseUrl || process.env.BASE_URL || process.env.PUBLIC_PATH || '/',
        pages: _getPages(path.join(process.cwd(), srcPath || process.env.SRC_PATH || './src'))
    }
}


