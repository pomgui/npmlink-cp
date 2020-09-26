const
    lib = require('../lib/npmlink');

describe('npmlink-cp', () => {
    describe('globs', () => {
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
                lib.globsToRegexp(glob, 0, list);
                const re = list[0];
                Object.keys(test)
                    .forEach(str => expect(re.test(str)).toBe(test[str], str));
            });
        }
    });
})