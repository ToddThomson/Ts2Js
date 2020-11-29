[![npm version](https://badge.fury.io/js/ts2js.svg)](http://badge.fury.io/js/ts2js)
﻿[![Build Status](https://travis-ci.org/ToddThomson/Ts2Js.svg?branch=master)](https://travis-ci.org/ToddThomson/Ts2Js)
# ts2js
A simple, fast, Typescript compiler supporting custom transforms, incremental and type checking builds. 

## Top Features
* Fast, cache optimized, in-memory builds
* Compiles projects, files and modules
* Incremental and type checking only builds
* Supports Typescript custom transforms
* Supports Typescript 4.1
* Experimental support for Solution builds

## ts2js Wiki

Documentation can be found on the ts2js [wiki](https://github.com/ToddThomson/Ts2Js/wiki).

## How to install

```
npm install ts2js
```
## Building ts2js

ts2js depends on [NPM](https://docs.npmjs.com/) as a package manager and 
[Gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) as a build tool. 
If you haven't already, you'll need to install both these tools in order to 
build ts2js.

Once Gulp is installed, you can build it with the following commands:

```
npm install
gulp build
```  