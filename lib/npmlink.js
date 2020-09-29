'use strict'
const
    fs = require('fs'),
    path = require('path');

function NpmLinkCp(pckDir) {
    this.include = ['package.json', /\b(?:README|README|CHANGES|LICEN[SC]E|NOTICE)(?:\.[^/]+|\b)*/, 'HISTORY', 'CHANGELOG'];
    this.exclude = ['.*.swp', '._*', '.wafpickle-*', 'node_modules/', '*.orig',
        /(?:\.gitignore|\.npmignore|\bpackage-lock\.json|\bCVS|\.git|\.hg|\.npmrc|\.lock-wscript|\.DS_Store|\.svn|\bconfig.gypi|npm-debug\.log)\b/];
    this.pckDir = pckDir;
}

NpmLinkCp.prototype = {
    process() {
        this.appendIncludeExcludeFiles();
        return this.copyFiles();
    },

    appendIncludeExcludeFiles: function () {
        const pckFile = path.join(this.pckDir, 'package.json');
        const pck = JSON.parse(fs.readFileSync(pckFile, 'utf8'));
        this.pckName = pck.name;
        if (pck.files) {
            this.useIncludedOnly = true;
            pck.files.forEach(pattern => this.include.push(pattern));
        } else
            this.addIgnored('.npmignore') || this.addIgnored('.gitignore');
        const doGlob2regex = (glob, i, list) => list[i] = this.globsToRegexp(glob);
        this.include.forEach(doGlob2regex);
        this.exclude.forEach(doGlob2regex);
    },

    addIgnored: function (file) {
        file = path.join(this.pckDir, file);
        if (!fs.existsSync(file)) return false;
        fs.readFileSync(file, 'utf8')
            .split('\n')
            .map(line => line.trim())
            .filter(line => {
                // Still not supported, because npm does not work as it's specified in the documentation
                // if (line.startsWith('!')) { this.include.push(line.substr(1)); line = ''; }
                if (line.startsWith('#')) line = '';
                return line;
            })
            .forEach(line => this.exclude.push(line));
        return true;
    },

    globsToRegexp: function (glob) {
        if (typeof glob != 'string') return glob;
        glob = glob.replace(/(?:\*\*\/)+/g, '(§:**/)§');
        if (glob.match(/^\/[^/]+$/)) glob = glob.substr(1) + '(§:/**)§';
        else if (glob.match(/^[^/]+\/$/)) glob = '(§:**/)§' + glob + '**';
        else glob = '(§:**/)§' + glob + '(§:/**)§';
        glob = glob.replace(/\.|\*\*|\*|\?/g, g =>
            ({ '.': '\\.', '**': '(?:(?!(?:/|^)\\.).)*?', '*': '[^/]*?', '?': '[^/]' }[g]));
        return new RegExp('^(?:' + glob.replace(/§/g, '?') + ')$');
    },

    copyFiles: function () {
        let sourceFiles = this.getFileList(this.pckDir);
        sourceFiles.forEach(this.docopy, this);
        return sourceFiles.length;
    },

    getFileList: function (root) {
        const list = [], me = this;
        appendToList(root);
        return list;
        function appendToList(dir) {
            const files = fs.readdirSync(dir, { encoding: 'utf8', withFileTypes: true });
            for (let i = 0; i < files.length; i++) {
                const file = path.join(dir, files[i].name);
                const short = path.relative(root, file);
                if (files[i].isDirectory() && me.isIncluded(short + '/', true)) appendToList(file, list);
                else if (files[i].isFile() && me.isIncluded(short, false)) list.push(short);
            }
        }
    },

    isIncluded: function (file, isDir) {
        const match = list => list.some(pattern => pattern.test(file));
        return this.useIncludedOnly && !isDir ? match(this.include) : !match(this.exclude) || match(this.include);
    },

    docopy: function (file) {
        const src = path.join(this.pckDir, file), dst = path.join('./node_modules/', this.pckName, file);
        const dir = path.dirname(dst);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.copyFileSync(src, dst);
        console.log(path.relative(this.pckDir, src));
    }
}
module.exports = NpmLinkCp
