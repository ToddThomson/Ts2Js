var path = require( 'path' );

var sourceRoot = 'src/';
var buildRoot = 'built/';
var releaseRoot = 'lib/';
var bundleRoot =  'bundle/'
var testRoot = 'tests/'

module.exports = {
    root: sourceRoot,
    test: testRoot,
    sourceTsConfig: sourceRoot + 'tsconfig.json',
    source: sourceRoot + '**/*.ts',
    output: buildRoot,
    main: buildRoot + sourceRoot + bundleRoot + 'TsCompiler.js',
    typings: buildRoot + sourceRoot + bundleRoot + 'TsCompiler.d.ts',
    release: releaseRoot
};
