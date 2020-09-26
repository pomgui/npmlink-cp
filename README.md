# npmlink-cp

An extremely lightweight (less than 100 lines of code) but powerful Node.js tool 
that simulates `npm link` by copying the files using the same rules of 
filtering than `npm publish` and `npm install` use<sup>[[1]](#f1)</sup>.

It's all done in the code without any third dependencies<sup>[[2]](#f2)</sup>

## Why?
There are situations when your awesome-package becomes unstable using `npm link` when you tries to use a library of your own that it's not as mature as you'd like, so you need to make one or two fixes on it once a while.

This has happened to me in packages that use module bundlers/uglifiers and libraries that depends on database drivers.

### Alternative solutions
There are several workarounds to this issue.

#### Use npm
Execute `npm publish` and `npm install` everytime you make any alterations on your dependencies.
##### Pros 
- You don't have to install anything additional.
##### Cons
- Too slow

#### Create your own script
- Create a shell script top copy the exact files that `npm` would create by itself.
##### Pros 
- You don't have to install anything additional.
##### Cons
- You need to create on different script for each linked dependency (or a complex script that accepts different file lists).

#### Install some third party tools
- There are some tools that already do this work for you.
##### Pros 
- You only have to make a `npm install -g ...`
##### Cons
- Most of these tools depend on several other packages, populating your global space with potential version problems or at least occuping more space than necessary.
- Most of them don't follow the rules to include or ignore files that `npm` use, making a copy of all files (except node_modules).

## Installation

```bash
$ npm install -g npmlink-cp
```

## Usage

```bash
$ npmlink-cp <path to package>...
```

## Footnotes
<span id="f1">[1]:</span> `bundledDependencies` are not yet supported.
<span id="f2">[2]:</span> NodeJs 10+ is required, and there are devDependencies only to execute the tests.
