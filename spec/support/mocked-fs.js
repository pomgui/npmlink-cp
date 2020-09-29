module.exports = {
    MockedFS,
}

function MockedFS(name, addicFiles, pckAddicProps) {
    let node = this['/tmp/myprojs'] = {};
    for (const dir of name.split('/'))
        node = node[dir] = {}
    if (addicFiles)
        normalizeDirs(addicFiles);
    Object.assign(node, addProject(name, addicFiles, pckAddicProps));
}

function normalizeDirs(dir) {
    for (f in dir) {
        const file = dir[f];
        if (Array.isArray(file)) dir[f] = file.join('\n');
        else if (typeof file == 'object') normalizeDirs(file);
    }
}

function addProject(name, addicFiles, pckAddicProps) {
    return Object.assign({
        'package.json': package(name, pckAddicProps),
        src: dirList('file1.ts', 'file2.ts', 'file1.spec.ts', 'file2.spec.ts'),
        dist: dirList('file1.js', 'file2.js', 'file1.spec.js', 'file2.spec.js'),
        test: dirList('test1.js', 'test2.js'),
        spec: dirList('test1.spec.js', 'test2.Spec.js'),
        coverage: dirList('index.html'),
        'README.md': '',
        'LICENSE': ''
    }, addicFiles);
}

function package(name, addic) {
    pck = Object.assign({ name, version: "1.0.0" }, addic);
    return JSON.stringify(pck);
}

function dirList(...list) {
    return list.reduce((dir, f) => (dir[f] = '', dir), {});
}
