#!/usr/bin/env node
const
    fs = require('fs'),
    NpmLinkCp = require('./lib/npmlink');

+function root() {
    if (process.argv.length < 3) {
        console.error('Usage: npmlink-cp <package-dir>...');
        process.exit(1);
    }
    for (let i = 2; i < process.argv.length; i++) {
        const dir = process.argv[i];
        if (!fs.statSync(dir).isDirectory())
            process.stderr.write(`WARNING: "${dir}" not processed, it's not a directory!\n`);
        else try {
            const start = Date.now();
            const app = new NpmLinkCp(dir);
            const n = app.process();
            process.stderr.write(dir + ': ' + n + ' files copied in ' + (Date.now() - start) + 'ms\n');
        } catch (e) {
            console.error(e.message);
            process.exit(2);
        }
    }
}();