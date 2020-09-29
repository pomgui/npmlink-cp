const
    mock = require('mock-fs'),
    fs = require('fs'),
    path = require('path'),
    NpmLinkCp = require('../lib/npmlink'),
    { MockedFS } = require('./support/mocked-fs');

describe('npmlink-cp', () => {
    describe('Glob', () => {
        const INTERNAL_FILE = 'dir1/dir2/word.ext', INTERNAL_DIR = 'dir1/word.ext/file',
            FIRST_DIR = 'word.ext/dir/file', FIRST_FILE = 'word.ext';
        let app;
        beforeAll(() => app = new NpmLinkCp());
        describe('"word.ext"', () => {
            const glob = 'word.ext';
            it(`should match "${INTERNAL_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_DIR)).toBe(true));
            it(`should match "${INTERNAL_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_FILE)).toBe(true));
            it(`should match "${FIRST_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_DIR)).toBe(true));
            it(`should match "${FIRST_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_FILE)).toBe(true));
        });
        describe(`Partial words:`, () => {
            it(`"word.ex" should fail with "${INTERNAL_DIR}"`, () =>
                expect(app.globsToRegexp(`word.ex`).test(INTERNAL_DIR)).toBe(false));
            it(`"ord.ext" should fail with "${INTERNAL_FILE}"`, () =>
                expect(app.globsToRegexp(`ord.ext`).test(INTERNAL_FILE)).toBe(false));
        });
        describe(`"word.ext/"`, () => {
            const glob = 'word.ext/';
            it(`should match with "${INTERNAL_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_DIR)).toBe(true));
            it(`should fails with "${INTERNAL_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_FILE)).toBe(false));
            it(`should match with "${FIRST_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_DIR)).toBe(true));
            it(`should fails with "${FIRST_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_FILE)).toBe(false));
        });
        describe(`"word*"`, () => {
            const glob = 'word*';
            it(`should match with "${INTERNAL_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_DIR)).toBe(true));
            it(`should match with "${INTERNAL_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_FILE)).toBe(true));
            it(`should match with "${FIRST_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_DIR)).toBe(true));
            it(`should match with "${FIRST_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_FILE)).toBe(true));
        });
        describe(`"word.?xt"`, () => {
            const glob = 'word.?xt';
            it(`should match with "${INTERNAL_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_DIR)).toBe(true));
            it(`should match with "${INTERNAL_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_FILE)).toBe(true));
            it(`should match with "${FIRST_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_DIR)).toBe(true));
            it(`should match with "${FIRST_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_FILE)).toBe(true));
        });
        describe(`"word.?"`, () => {
            const glob = 'word.?';
            it(`should fail with "${INTERNAL_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_DIR)).toBe(false));
            it(`should fail with "${INTERNAL_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_FILE)).toBe(false));
            it(`should fail with "${FIRST_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_DIR)).toBe(false));
            it(`should fail with "${FIRST_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_FILE)).toBe(false));
        });
        describe(`"**/word.ext"`, () => {
            const glob = '**/word.ext';
            it(`should match with "${INTERNAL_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_DIR)).toBe(true));
            it(`should match with "${INTERNAL_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_FILE)).toBe(true));
            it(`should match with "${FIRST_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_DIR)).toBe(true));
            it(`should match with "${FIRST_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_FILE)).toBe(true));
        });
        describe(`"**/**/word.ext"`, () => {
            const glob = '**/**/word.ext';
            it(`should match with "${INTERNAL_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_DIR)).toBe(true));
            it(`should match with "${INTERNAL_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_FILE)).toBe(true));
            it(`should match with "${FIRST_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_DIR)).toBe(true));
            it(`should match with "${FIRST_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_FILE)).toBe(true));
        });
        describe(`"word.ext/**"`, () => {
            const glob = 'word.ext/**';
            it(`should match with "${INTERNAL_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_DIR)).toBe(true));
            it(`should fail with "${INTERNAL_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_FILE)).toBe(false));
            it(`should match with "${FIRST_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_DIR)).toBe(true));
            it(`should fail with "${FIRST_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_FILE)).toBe(false));
        });
        describe(`"/word*`, () => {
            const glob = '/word*';
            it(`should fail with "${INTERNAL_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_DIR)).toBe(false));
            it(`should fail with "${INTERNAL_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(INTERNAL_FILE)).toBe(false));
            it(`should match with "${FIRST_DIR}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_DIR)).toBe(true));
            it(`should match with "${FIRST_FILE}"`, () =>
                expect(app.globsToRegexp(glob).test(FIRST_FILE)).toBe(true));
        });
    });

    describe('Execution', () => {
        let origLog;
        beforeAll(() => {
            origLog = console.log;
            console.log = () => { };
        });
        afterAll(() => {
            console.log = origLog;
        });

        describe('Without pck.files, .npmignore, nor .gitignore:', () => {
            const name = 'all_files';
            beforeAll(() => {
                mock(new MockedFS(name))
            });
            afterAll(() => mock.restore());

            it('should copy all files', () => {
                new NpmLinkCp('/tmp/myprojs/' + name).process();
                expect(getCopiedFileList(`./node_modules/` + name)).toEqual([
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
                ].sort());
            });
        });

        describe('Only .npmignore is defined', () => {
            const name = 'use_npmignore';
            beforeAll(() => {
                mock(new MockedFS(name, {
                    '.npmignore': ['# Comment', 'test/', 'src/', '**/*.html', '**/*[sS]pec.*']
                }))
            });
            afterAll(() => mock.restore());

            it(`should ignore 'test/', 'src/', '**/*.html', '**/*[sS]pec.*'`, () => {
                new NpmLinkCp('/tmp/myprojs/' + name).process();
                expect(getCopiedFileList(`./node_modules/` + name)).toEqual([
                    'dist/file1.js',
                    'dist/file2.js',
                    'LICENSE',
                    'package.json',
                    'README.md',
                    // 'test/test1.js',
                ].sort());
            });
        });

        describe('Only .gitignore is defined', () => {
            const name = 'use_gitignore';
            beforeAll(() => {
                mock(new MockedFS(name, {
                    '.gitignore': ['# Comment', 'test/', 'src/', '**/*.html', '**/*[sS]pec.*']
                }))
            });
            afterAll(() => mock.restore());

            it(`should ignore 'test/', 'src/', '**/*.html', '**/*[sS]pec.*'`, () => {
                new NpmLinkCp('/tmp/myprojs/' + name).process();
                expect(getCopiedFileList(`./node_modules/` + name)).toEqual([
                    'dist/file1.js',
                    'dist/file2.js',
                    'LICENSE',
                    'package.json',
                    'README.md',
                    // 'test/test1.js',
                ].sort());
            });
        });

        describe('Both .gitignore and .npmignore are defined', () => {
            const name = 'use_gitignore_npmignore';
            beforeAll(() => {
                mock(new MockedFS(name, {
                    '.gitignore': ['test/', 'src/', '**/*.html', '**/*[sS]pec.*'],
                    '.npmignore': ['test/', 'src/', '**/*[sS]pec.*']
                }))
            });
            afterAll(() => mock.restore());

            it(`should use .pnignore instead of .gitignore`, () => {
                new NpmLinkCp('/tmp/myprojs/' + name).process();
                expect(getCopiedFileList(`./node_modules/` + name)).toEqual([
                    'coverage/index.html',
                    'dist/file1.js',
                    'dist/file2.js',
                    'LICENSE',
                    'package.json',
                    'README.md',
                ].sort());
            });
        });

        describe('pckage.files is defined', () => {
            const name = 'use_files';
            beforeAll(() => {
                mock(new MockedFS(name, {
                    '.gitignore': ['test/', 'src/', '**/*.html', '**/*[sS]pec.*'],
                    '.npmignore': ['test/', 'src/', '**/*[sS]pec.*']
                }, {
                    files: ['dist/**/*.js']
                }))
            });
            afterAll(() => mock.restore());

            it(`should use pck.files and skip .npmignore/.gitignore files`, () => {
                new NpmLinkCp('/tmp/myprojs/' + name).process();
                expect(getCopiedFileList(`./node_modules/` + name)).toEqual([
                    'dist/file1.js',
                    'dist/file1.spec.js',
                    'dist/file2.js',
                    'dist/file2.spec.js',
                    'README.md',
                    'LICENSE',
                    'package.json'
                ].sort());
            });
        });

        describe('composed names', () => {
            const name = 'composed/names';
            beforeAll(() => {
                mock(new MockedFS(name, null, {
                    files: ['dist/**/file[12].js']
                }))
            });
            afterAll(() => mock.restore());

            it(`should create the same structure using name as a path inside node_modules`, () => {
                new NpmLinkCp('/tmp/myprojs/' + name).process();
                expect(getCopiedFileList(`./node_modules/` + name)).toEqual([
                    'dist/file1.js',
                    'dist/file2.js',
                    'README.md',
                    'LICENSE',
                    'package.json'
                ].sort());
            });
        });

        function getCopiedFileList(root) {
            const list = [];
            readdir(root = path.normalize(root));
            return list.sort();
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