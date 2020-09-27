'use strict'
const
    fs = require('fs'),
    path = require('path');

function NpmLinkCp(pckDir) {
    this.include = [
        'package.json', /\b(README|README|CHANGES|LICEN[SC]E|NOTICE)(\.[^/]+|\b)*/, 'HISTORY', 'CHANGELOG'
    ];
    this.exclude = [
        '.*.swp', '._*', '.DS_Store', '.git', '.hg', '.npmrc', '.lock-wscript',
        '.svn', '.wafpickle-*', 'config.gypi', 'CVS', 'npm-debug.log', 'node_modules/',
        '.gitignore', '.npmignore', 'package-lock.json', '*.orig'
    ];
    this.pckDir = pckDir;
    this.pckName = '';
    this.onlyIncluded;
}

NpmLinkCp.prototype.process = function () {
    this.appendIncludeExcludeFiles();
    this.copyFiles();
}

NpmLinkCp.prototype.appendIncludeExcludeFiles = function () {
    const pckFile = path.join(this.pckDir, 'package.json');
    const pckStr = fs.readFileSync(pckFile, 'utf8');
    const pck = JSON.parse(pckStr);
    this.pckName = pck.name;
    if (pck.files) {
        this.onlyIncluded = true;
        this.include.push(...pck.files);
    } else
        this.addIgnored('.npmignore');
    this.include.forEach(this.globsToRegexp);
    this.exclude.forEach(this.globsToRegexp);
}

NpmLinkCp.prototype.addIgnored = function (file) {
    file = path.join(this.pckDir, file);
    if (!fs.existsSync(file))
        return false;
    this.exclude.push(...
        fs.readFileSync(file, 'utf8')
            .split('\n')
            .map(line => line.trim())
            .filter(line => {
                if (line.startsWith('!')) { this.include.push(line.substr(1)); line = ''; }
                if (line.startsWith('#')) line = '';
                return line;
            }));
    return true;
}

NpmLinkCp.prototype.globsToRegexp = function (pattern, i, list) {
    if (!(pattern instanceof RegExp)) {
        pattern = pattern
            .replace(/^(\w|\?)/, '\\b$1').replace(/(\w|\?)$/, '$1\\b')
            .replace(/\.|\*\*\/|\*|\?|^\//g, g => ({ '.': '\\.', '**/': '(.*/)*', '*': '[^/]*', '?': '[^/]', '/': '^' }[g]));
        list[i] = new RegExp(pattern);
    }
}

NpmLinkCp.prototype.copyFiles = function () {
    let list = [];
    this.getFileList(this.pckDir, list);
    if (this.pckName == 'specific_js');
    list.forEach(this.docopy, this);
}

NpmLinkCp.prototype.docopy = function (file) {
    const src = path.join(this.pckDir, file), dst = path.join('./node_modules/', this.pckName, file);
    const dir = path.dirname(dst);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(src, dst);
}

NpmLinkCp.prototype.getFileList = function (dir, list) {
    const files = fs.readdirSync(dir, { encoding: 'utf8', withFileTypes: true });
    for (const f of files) {
        const file = path.join(dir, f.name);
        const short = path.relative(this.pckDir, file);
        if (f.isDirectory() && this.isIncluded(short, true)) this.getFileList(file, list);
        else if (f.isFile() && this.isIncluded(short, false)) list.push(short);
    }
}

NpmLinkCp.prototype.isIncluded = function (file, isDir) {
    const isExcluded = this.exclude.some(pattern => pattern.test(file));
    const isIncluded = this.include.some(pattern => pattern.test(file));
    return this.onlyIncluded && !isDir ? isIncluded : !isExcluded || isIncluded;
}

module.exports = NpmLinkCp
