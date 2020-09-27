const
    mock = require('mock-fs'),
    NpmLinkCp = require('../lib/npmlink'),
    { MockedFS } = require('./support/mocked-fs'),
    fs = require('fs'),
    path = require('path');

// function mock() { }
// mock.restore = () => { };
// class MockedFS { }

describe('npmlink-cp', () => {
    describe('Globs handling', () => {
        let app;
        beforeAll(() => app = new NpmLinkCp());
        globs('"word" matches files&dirs in any place',
            'xpto', { 'dir/dir2/xpto/file': true, 'dir/dir2/xpto': true, 'xpto/dir/file': true });
        globs('"word" does not match partial names',
            'xpto', { 'dir/dir2/axpto/file': false, 'dir/dir2/xptos': false, 'zxpto/dir/file': false });
        globs('"word" matches files&dirs in the root',
            '/xpto', { 'dir/dir2/xpto/file': false, 'dir/dir2/xpto': false, 'xpto/dir/file': true });
        globs('"word/" matches only directories',
            'xpto/', { 'dir/xpto/file': true, 'dir/xpto': false, 'xpto/dir/file': true })
        globs('"*" matches any char but "/"',
            '*.js', { 'dir/a.js': true, 'bx.js': true, 'dir/dir.js/file': true })
        globs('"?" matches any char but "/"',
            '?.js', { 'dir/a.js': true, 'bx.js': false, 'x.js/file': true })
        globs('"**/" matches n-level of directories',
            '**/xpto', { 'dir/dir2/xpto': true, 'dir/xpto/file': true, 'dir/xpto': true, 'xpto': true })
        globs('"**/**/" behaves like "**/"',
            '**/**/xpto', { 'dir/dir2/xpto': true, 'dir/xpto/file': true, 'dir/xpto': true, 'xpto': true })
        globs('"*" matches any char but "/"',
            'xp*to', { 'dir/dir2/xpto': true, 'dir/xp-to/file': true, 'dir/xp.XP.123.to': true, 'xpto': true })
        function globs(title, glob, test) {
            it(title, () => {
                const list = [glob];
                app.globsToRegexp(glob, 0, list);
                const re = list[0];
                Object.keys(test)
                    .forEach(str => expect(re.test(str)).toBe(test[str], str));
            });
        }
    });

    describe('Execution', () => {
        beforeAll(() => {
            mock(new MockedFS());
        });
        afterAll(() => mock.restore());

        testType('should copy all files', '/myprojs/all_files', 'all_files', [
            'coverage/index.html',
            'dist/file1.js',
            'dist/file1.spec.js',
            'dist/file2.js',
            'dist/file2.spec.js',
            'LICENSE',
            'package.json',
            'README.md',
            'spec/test1.spec.js',
            'spec/test2.Spec.js',
            'src/file1.spec.ts',
            'src/file1.ts',
            'src/file2.spec.ts',
            'src/file2.ts',
            'test/test1.js',
            'test/test2.js',
        ]);

        testType('should use .npmignore', '/myprojs/ignore_tests', 'ignore_tests', [
            'coverage/index.html',
            'dist/file1.js',
            'dist/file2.js',
            'LICENSE',
            'package.json',
            'README.md',
            'src/file1.ts',
            'src/file2.ts',
        ]);

        testType('should ignore tests, src, html', '/myprojs/ignore_tests_src', 'ignore_tests_src', [
            'dist/file1.js',
            'dist/file2.js',
            'LICENSE',
            'package.json',
            'README.md',
            'test/test1.js', // In .npmignore it was with the prefix "!"
        ]);

        testType('should use package.files="**/*.js"', '/myprojs/all_js', 'all_js', [
            'dist/file1.js',
            'dist/file1.spec.js',
            'dist/file2.js',
            'dist/file2.spec.js',
            'LICENSE',
            'package.json',
            'README.md',
            'spec/test1.spec.js',
            'spec/test2.Spec.js',
            'test/test1.js',
            'test/test2.js',
        ]);

        testType('should copy specific files', '/myprojs/specific_js', 'specific_js', [
            'dist/file2.js',
            'LICENSE',
            'package.json',
            'README.md',
        ]);

        testType('should support composed names', '/myprojs/composed/name', 'composed/name', [
            'dist/file1.js',
            'dist/file1.spec.js',
            'dist/file2.js',
            'dist/file2.spec.js',
            'LICENSE',
            'package.json',
            'README.md',
        ]);

        function testType(title, pckDir, pckName, expected) {
            it(title, () => {
                const app = new NpmLinkCp('/tmp/' + pckDir);
                app.process();
                const list = getFileList(`./node_modules/${pckName}`);
                expect(list.sort()).toEqual(expected.sort());
            });
        }

        function getFileList(root) {
            const list = [];
            readdir(root = path.normalize(root));
            return list;
            function readdir(dir) {
                const files = fs.readdirSync(dir, { encoding: 'utf8', withFileTypes: true });
                for (const f of files) {
                    const file = path.join(dir, f.name);
                    if (f.isDirectory()) readdir(file);
                    else list.push(file.substr(root.length + 1));
                }
            }
        }
    });

});