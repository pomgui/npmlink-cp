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
            console.warn(`WARNING: "${dir}" not processed, it's not a directory!`);
        else try {
            console.time(dir);
            const app = new NpmLinkCp(dir);
            app.process();
            console.timeEnd(dir);
        } catch (e) {
            console.error(e.message);
            process.exit(2);
        }
    }
}();