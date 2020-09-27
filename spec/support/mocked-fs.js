module.exports = {
    MockedFS,
}

function MockedFS() {
    const myprojs = Object.assign({},
        addProject('all_files'),
        addProject('ignore_tests', { '.npmignore': ['test/', '**/*[sS]pec.*'].join('\n') }),
        addProject('ignore_tests_src', { '.npmignore': ['# Comment', 'test/', 'src/', '**/*.html', '**/*[sS]pec.*', '!test/test1.js'].join('\n') }),
        addProject('all_js', null, { files: ['**/*.js'] }),
        addProject('specific_js', null, { files: ['dist/file2.js'] }),
        { composed: addProject('name', null, { name: 'composed/name', files: ['dist/**/*.js'] }) }
    );
    this['/tmp/myprojs'] = myprojs;
}

function addProject(name, addicFiles, pckAddicProps) {
    return {
        [name]: Object.assign({
            'package.json': package(name, pckAddicProps),
            src: dirList('file1.ts', 'file2.ts', 'file1.spec.ts', 'file2.spec.ts'),
            dist: dirList('file1.js', 'file2.js', 'file1.spec.js', 'file2.spec.js'),
            test: dirList('test1.js', 'test2.js'),
            spec: dirList('test1.spec.js', 'test2.Spec.js'),
            coverage: dirList('index.html'),
            'README.md': '',
            'LICENSE': ''
        }, addicFiles)
    };
}

function package(name, addic) {
    pck = Object.assign({ name, version: "1.0.0" }, addic);
    return JSON.stringify(pck);
}

function dirList(...list) {
    return list.reduce((dir, f) => (dir[f] = '', dir), {});
}
