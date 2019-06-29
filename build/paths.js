var path = require( 'path' );

var sourceRoot = 'src/';
var buildRoot = './built/';
var releaseRoot = './lib/';
var testRoot = './tests/spec/';
var bundleRoot = 'bundle/';

module.exports = {
    root: sourceRoot,
    tests: testRoot + '**/*.js',
    sourceTsConfig: sourceRoot + 'tsconfig.json',
    source: sourceRoot + '**/*.ts',
    output: buildRoot,
    main: buildRoot + sourceRoot + bundleRoot + 'TsCompiler.js',
    typings: buildRoot + sourceRoot + bundleRoot + 'TsCompiler.d.ts',
    release: releaseRoot
};
