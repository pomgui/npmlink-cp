#!/usr/bin/env node
const
    fs = require('fs'),
    path = require('path');

const
    include = [
        'package.json', 'README*', 'CHANGELOG*', 'LICENSE', 'LICESCE',
    ],
    exclude = [
        '.*.swp', '._*', '.DS_Store', '.git', '.hg', '.npmrc', '.lock-wscript',
        '.svn', '.wafpickle-*', 'config.gypi', 'CVS', 'npm-debug.log', 'node_modules/',
        '.gitignore', '.npmignore', 'package-lock.json'
    ];
var pckDir, hasPckFiles;

function main(dir) {
    pckDir = dir;
    getIncludeExcludeFiles();
    copyFiles();
}

function getIncludeExcludeFiles() {
    pck = require(path.join(pckDir, 'package.json'));
    if (hasPckFiles = !!pck.files)
        include.push(...pck.files);
    addIgnored('.npmignore');
    // TODO:
    // const bundled = pck.bundledDependencies || pck.bundleDependencies || [];
    // include.push(...bundled.map(b => `node_modules/${b}/`));
    include.forEach(globsToRegexp);
    exclude.forEach(globsToRegexp);
}

function addIgnored(file) {
    file = path.join(pckDir, file);
    if (!fs.existsSync(file))
        return false;
    exclude.push(...
        fs.readFileSync(file, 'utf8')
            .split('\n')
            .map(line => line.trim())
            .filter(line => {
                if (line.startsWith('!')) { include.push(line.substr(1)); line = ''; }
                if (line.startsWith('#')) line = '';
                return line;
            }));
    return true;
}

function globsToRegexp(pattern, i, list) {
    pattern = pattern
        .replace(/^(\w|\?)/, '\\b$1').replace(/(\w|\?)$/, '$1\\b')
        .replace(/\.|\*\*\/|\*|\?|^\//g, g => ({ '.': '\\.', '**/': '(.*/)*', '*': '[^/]*', '?': '[^/]', '/': '^' }[g] || g));
    list[i] = new RegExp(pattern);
}

function copyFiles() {
    let list = [];
    getFileList(pckDir, list);
    list.forEach(docopy);
}

function docopy(file) {
    // const dir = path.dirname(file);
    // if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // fs.copyFileSync(path.join(pckDir, file), path.join('.', file));
    console.log(file);
}

function getFileList(dir, list) {
    fs.readdirSync(dir, { encoding: 'utf8', withFileTypes: true })
        .forEach(f => {
            const file = path.join(dir, f.name);
            const short = path.relative(pckDir, file);
            if (f.isDirectory()/* && isIncluded(short)*/) getFileList(file, list);
            else if (f.isFile() && isIncluded(short)) list.push(short);
        });
}

function isIncluded(file) {
    const isExcluded = exclude.some(pattern => pattern.test(file));
    const isIncluded = include.some(pattern => pattern.test(file));
    return hasPckFiles ? isIncluded && !isExcluded : !isExcluded || isIncluded;
}

module.exports = {
    main,
    // For tests:
    globsToRegexp,
}