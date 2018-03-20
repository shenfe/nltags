const fs = require('fs');
const path = require('path');

const readFile = absFilePath => {
    if (!fs.existsSync(absFilePath)) return null;
    let re = null;
    try {
        re = fs.readFileSync(absFilePath, 'utf8');
    } catch (e) {
    }
    return re;
};

const readData = (absFilePath, raw) => {
    let content = readFile(absFilePath);
    if (raw) {
        return content;
    }
    if (content === null) return {};
    let data = {};
    try {
        data = JSON.parse(content);
    } catch (e) {
    }
    return data;
};

const ensureDir = dir => {
    let dirs = dir.split('/');
    let p = [];
    while (true) {
        if (!dirs.length) break;
        p.push(dirs.shift());
        let d = p.join('/');
        if (d === '') continue;
        if (fs.existsSync(d) && fs.statSync(d).isDirectory()) continue;
        fs.mkdirSync(d);
    }
};

module.exports = {
    readFile,
    readData,
    ensureDir
};