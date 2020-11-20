"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TsCompiler = exports.Compiler = exports.CompileStream = exports.CompileResult = exports.CompileStatus = exports.CachingCompilerHost = void 0;
var ts = require("typescript");
var fs = require("fs");
var path = require("path");
var stream = require("stream");
var TsCore;
(function (TsCore) {
    /** Does nothing. */
    function noop(_) { } // tslint:disable-line no-empty
    TsCore.noop = noop;
    /** Do nothing and return false */
    function returnFalse() { return false; }
    TsCore.returnFalse = returnFalse;
    /** Do nothing and return true */
    function returnTrue() { return true; }
    TsCore.returnTrue = returnTrue;
    /** Do nothing and return undefined */
    function returnUndefined() { return undefined; }
    TsCore.returnUndefined = returnUndefined;
    /** Returns its argument. */
    function identity(x) { return x; }
    TsCore.identity = identity;
    /** Returns lower case string */
    function toLowerCase(x) { return x.toLowerCase(); }
    TsCore.toLowerCase = toLowerCase;
    /** Throws an error because a function is not implemented. */
    function notImplemented() {
        throw new Error("Not implemented");
    }
    TsCore.notImplemented = notImplemented;
    function fileExtensionIs(path, extension) {
        var pathLen = path.length;
        var extLen = extension.length;
        return pathLen > extLen && path.substr(pathLen - extLen, extLen) === extension;
    }
    TsCore.fileExtensionIs = fileExtensionIs;
    function fileExtensionIsOneOf(path, extensions) {
        for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
            var extension = extensions_1[_i];
            if (fileExtensionIs(path, extension)) {
                return true;
            }
        }
        return false;
    }
    TsCore.fileExtensionIsOneOf = fileExtensionIsOneOf;
    TsCore.supportedExtensions = [".ts", ".tsx", ".d.ts"];
    TsCore.moduleFileExtensions = TsCore.supportedExtensions;
    function isSupportedSourceFileName(fileName) {
        if (!fileName) {
            return false;
        }
        for (var _i = 0, supportedExtensions_1 = TsCore.supportedExtensions; _i < supportedExtensions_1.length; _i++) {
            var extension = supportedExtensions_1[_i];
            if (fileExtensionIs(fileName, extension)) {
                return true;
            }
        }
        return false;
    }
    TsCore.isSupportedSourceFileName = isSupportedSourceFileName;
    function createDiagnostic(message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var text = message.message;
        if (arguments.length > 1) {
            text = formatStringFromArgs(text, arguments, 1);
        }
        return {
            file: undefined,
            start: undefined,
            length: undefined,
            messageText: text,
            category: message.category,
            code: message.code
        };
    }
    TsCore.createDiagnostic = createDiagnostic;
    function formatStringFromArgs(text, args, baseIndex) {
        baseIndex = baseIndex || 0;
        return text.replace(/{(\d+)}/g, function (match, index) {
            return args[+index + baseIndex];
        });
    }
    function normalizeSlashes(path) {
        return path.replace(/\\/g, "/");
    }
    TsCore.normalizeSlashes = normalizeSlashes;
    function outputExtension(path) {
        return path.replace(/\.ts/, ".js");
    }
    TsCore.outputExtension = outputExtension;
    function getConfigFileName(configFilePath) {
        try {
            var isConfigDirectory = fs.lstatSync(configFilePath).isDirectory();
        }
        catch (e) {
            return undefined;
        }
        if (isConfigDirectory) {
            return path.join(configFilePath, "tsconfig.json");
        }
        else {
            return configFilePath;
        }
    }
    TsCore.getConfigFileName = getConfigFileName;
    /**
     * Parse standard project configuration objects: compilerOptions, files.
     * @param configFilePath
     */
    function readConfigFile(configFilePath) {
        var configFileName = TsCore.getConfigFileName(configFilePath);
        if (!configFileName) {
            var diagnostic = TsCore.createDiagnostic({
                code: 6064,
                category: ts.DiagnosticCategory.Error,
                key: "Cannot_read_project_path_0_6064",
                message: "Cannot read project path '{0}'."
            }, configFilePath);
            return {
                errors: [diagnostic]
            };
        }
        var readConfigResult = ts.readConfigFile(configFileName, function (fileName) {
            return ts.sys.readFile(fileName);
        });
        if (readConfigResult.error) {
            return {
                errors: [readConfigResult.error]
            };
        }
        var fullFileName = path.resolve(configFileName);
        return {
            fileName: fullFileName,
            basePath: path.dirname(fullFileName),
            config: readConfigResult.config,
            errors: [],
        };
    }
    TsCore.readConfigFile = readConfigFile;
    function getProjectConfig(configFilePath) {
        var configFile = readConfigFile(configFilePath);
        if (configFile.errors.length > 0) {
            return {
                options: undefined,
                fileNames: [],
                errors: configFile.errors
            };
        }
        return ts.parseJsonConfigFileContent(configFile.config, ts.sys, configFile.basePath, undefined, configFile.fileName);
    }
    TsCore.getProjectConfig = getProjectConfig;
})(TsCore || (TsCore = {}));
var Utils;
(function (Utils) {
    function forEach(array, callback) {
        if (array) {
            for (var i = 0, len = array.length; i < len; i++) {
                var result = callback(array[i], i);
                if (result) {
                    return result;
                }
            }
        }
        return undefined;
    }
    Utils.forEach = forEach;
    function contains(array, value) {
        if (array) {
            for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
                var v = array_1[_i];
                if (v === value) {
                    return true;
                }
            }
        }
        return false;
    }
    Utils.contains = contains;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function hasProperty(map, key) {
        return hasOwnProperty.call(map, key);
    }
    Utils.hasProperty = hasProperty;
    function map(array, f) {
        var result;
        if (array) {
            result = [];
            for (var _i = 0, array_2 = array; _i < array_2.length; _i++) {
                var v = array_2[_i];
                result.push(f(v));
            }
        }
        return result;
    }
    Utils.map = map;
    function extend(first, second) {
        var result = {};
        for (var id in second) {
            if (hasOwnProperty.call(second, id)) {
                result[id] = second[id];
            }
        }
        for (var id in first) {
            if (hasOwnProperty.call(first, id)) {
                result[id] = first[id];
            }
        }
        return result;
    }
    Utils.extend = extend;
    //export function extend( first: any, second: any ): any
    //{
    //    let result: any = {};
    //    for ( let id in first )
    //    {
    //        ( result as any )[id] = first[id];
    //    }
    //    for ( let id in second )
    //    {
    //        if ( !hasProperty( result, id ) )
    //        {
    //            ( result as any )[id] = second[id];
    //        }
    //    }
    //    return result;
    //}
    function replaceAt(str, index, character) {
        return str.substr(0, index) + character + str.substr(index + character.length);
    }
    Utils.replaceAt = replaceAt;
})(Utils || (Utils = {}));
var CompileStatus;
(function (CompileStatus) {
    CompileStatus[CompileStatus["Success"] = 0] = "Success";
    CompileStatus[CompileStatus["DiagnosticsPresent_OutputsSkipped"] = 1] = "DiagnosticsPresent_OutputsSkipped";
    CompileStatus[CompileStatus["DiagnosticsPresent_OutputsGenerated"] = 2] = "DiagnosticsPresent_OutputsGenerated";
})(CompileStatus || (CompileStatus = {}));
exports.CompileStatus = CompileStatus;
var CompileResult = /** @class */ (function () {
    function CompileResult(status, errors, emitOutput) {
        this.status = status;
        this.errors = errors || [];
        this.output = emitOutput || [];
    }
    CompileResult.prototype.getErrors = function () {
        return this.errors;
    };
    CompileResult.prototype.getStatus = function () {
        return this.status;
    };
    CompileResult.prototype.getOutput = function () {
        return this.output;
    };
    CompileResult.prototype.succeeded = function () {
        return (this.status === CompileStatus.Success);
    };
    return CompileResult;
}());
exports.CompileResult = CompileResult;
var CachingCompilerHost = /** @class */ (function () {
    function CachingCompilerHost(compilerOptions) {
        var _this = this;
        this.system = ts.sys;
        this.output = {};
        this.dirExistsCache = {};
        this.fileExistsCache = {};
        this.fileReadCache = {};
        this.getOutput = function () {
            return _this.output;
        };
        this.readFile = function (fileName) {
            if (_this.isBuildInfoFile(fileName)) {
                return _this.baseHost.readFile(fileName);
            }
            if (Utils.hasProperty(_this.fileReadCache, fileName)) {
                return _this.fileReadCache[fileName];
            }
            return _this.fileReadCache[fileName] = _this.baseHost.readFile(fileName);
        };
        this.writeFile = function (fileName, data, writeByteOrderMark, onError) {
            // The incremental BuildInfoFile must be output to disk.
            if (_this.isBuildInfoFile(fileName)) {
                return _this.baseHost.writeFile(fileName, data, writeByteOrderMark);
            }
            // TODO: Review changes for release 4.1
            //this.baseHost.writeFile( fileName, data, writeByteOrderMark );
            _this.output[fileName] = data;
        };
        this.directoryExists = function (directoryPath) {
            if (Utils.hasProperty(_this.dirExistsCache, directoryPath)) {
                return _this.dirExistsCache[directoryPath];
            }
            return _this.dirExistsCache[directoryPath] = ts.sys.directoryExists(directoryPath);
        };
        this.fileExists = function (fileName) {
            fileName = _this.getCanonicalFileName(fileName);
            // Prune off searches on directories that don't exist
            if (!_this.directoryExists(path.dirname(fileName))) {
                return false;
            }
            if (Utils.hasProperty(_this.fileExistsCache, fileName)) {
                return _this.fileExistsCache[fileName];
            }
            return _this.fileExistsCache[fileName] = _this.baseHost.fileExists(fileName);
        };
        // Use Typescript CompilerHost "base class" implementation..
        this.getSourceFile = function (fileName, languageVersion, onError) {
            return _this.baseHost.getSourceFile(fileName, languageVersion, onError);
        };
        this.getDefaultLibFileName = function (options) {
            return _this.baseHost.getDefaultLibFileName(options);
        };
        this.getCurrentDirectory = function () {
            return _this.baseHost.getCurrentDirectory();
        };
        this.getDirectories = function (path) {
            return _this.baseHost.getDirectories(path);
        };
        this.getCanonicalFileName = function (fileName) {
            return _this.baseHost.getCanonicalFileName(fileName);
        };
        this.useCaseSensitiveFileNames = function () {
            return _this.baseHost.useCaseSensitiveFileNames();
        };
        this.getNewLine = function () {
            return _this.baseHost.getNewLine();
        };
        this.compilerOptions = compilerOptions;
        // TODO: Review Composite option
        if (compilerOptions.incremental /* || compilerOptions.composite */)
            this.baseHost = ts.createIncrementalCompilerHost(this.compilerOptions, this.system);
        else
            this.baseHost = ts.createCompilerHost(this.compilerOptions);
    }
    CachingCompilerHost.prototype.readDirectory = function (rootDir, extensions, exclude, include, depth) {
        return this.baseHost.readDirectory(rootDir, extensions, exclude, include, depth);
    };
    CachingCompilerHost.prototype.isBuildInfoFile = function (file) {
        return TsCore.fileExtensionIs(file, ts.Extension.TsBuildInfo.toString());
    };
    return CachingCompilerHost;
}());
exports.CachingCompilerHost = CachingCompilerHost;
var SolutionBuilderHost = /** @class */ (function (_super) {
    __extends(SolutionBuilderHost, _super);
    function SolutionBuilderHost(compilerOptions, createProgram) {
        var _this = _super.call(this, compilerOptions) || this;
        _this.diagnostics = [];
        _this.createProgram = createProgram || ts.createEmitAndSemanticDiagnosticsBuilderProgram;
        return _this;
    }
    SolutionBuilderHost.prototype.deleteFile = function (fileName) {
        this.system.deleteFile(fileName);
    };
    SolutionBuilderHost.prototype.getModifiedTime = function (fileName) {
        return this.system.getModifiedTime(fileName);
    };
    SolutionBuilderHost.prototype.setModifiedTime = function (fileName, date) {
        this.system.setModifiedTime(fileName, date);
    };
    SolutionBuilderHost.prototype.reportDiagnostic = function (diagnostic) {
        this.diagnostics.push(diagnostic);
    };
    SolutionBuilderHost.prototype.reportSolutionBuilderStatus = function (diagnostic) {
        this.diagnostics.push(diagnostic);
    };
    SolutionBuilderHost.prototype.clearDiagnostics = function () {
        this.diagnostics.length = 0;
    };
    return SolutionBuilderHost;
}(CachingCompilerHost));
var Compiler = /** @class */ (function () {
    function Compiler() {
    }
    Compiler.prototype.getProgram = function () {
        if (this.isBuilderProgram(this.program)) {
            return this.program.getProgram();
        }
        else {
            return this.program;
        }
    };
    Compiler.prototype.compileFiles = function (rootFileNames, compilerOptions, compileOptions, transformers) {
        compileOptions = compileOptions ? Utils.extend(compileOptions, Compiler.defaultCompileOptions) : Compiler.defaultCompileOptions;
        this.options = compilerOptions;
        // TODO: Review
        // Check for type checking only compile option.
        // NOTE: overriding noEmit should not change the incremental build state.
        //       this needs to be reviewed.
        if (compileOptions.typeCheckOnly) {
            this.options.noEmit = true;
        }
        this.host = new CachingCompilerHost(this.options);
        if (this.options.Incrementatal) {
            this.program = ts.createIncrementalProgram({
                rootNames: rootFileNames,
                options: this.options,
                host: this.host
            });
            return this.emitFiles(this.program, transformers);
        }
        else {
            this.program = ts.createProgram({
                rootNames: rootFileNames,
                options: compilerOptions,
                host: this.host
            });
            return this.emitFiles(this.program, transformers);
        }
    };
    Compiler.prototype.compileProject = function (configFilePath, compileOptions, transformers) {
        compileOptions = compileOptions ? Utils.extend(compileOptions, Compiler.defaultCompileOptions) : Compiler.defaultCompileOptions;
        var config = TsCore.getProjectConfig(configFilePath);
        if (config.errors.length > 0) {
            return new CompileResult(CompileStatus.DiagnosticsPresent_OutputsSkipped, config.errors);
        }
        this.options = config.options;
        // TODO: Review
        // Check for type checking only compile option.
        // NOTE: overriding noEmit should not change the incremental build state.
        //       this needs to be reviewed.
        if (compileOptions.typeCheckOnly) {
            this.options.noEmit = true;
        }
        this.host = new CachingCompilerHost(this.options);
        if (this.options.Incrementatal) {
            this.program = ts.createIncrementalProgram({
                rootNames: config.fileNames,
                options: this.options,
                host: this.host
            });
            return this.emitFiles(this.program, transformers);
        }
        else {
            this.program = ts.createProgram({
                rootNames: config.fileNames,
                options: config.options,
                host: this.host
            });
            return this.emitFiles(this.program, transformers);
        }
    };
    Compiler.prototype.compileModule = function (input, moduleFileName, transformers) {
        var defaultGetSourceFile;
        function getSourceFile(fileName, languageVersion, onError) {
            if (fileName === moduleFileName) {
                return moduleSourceFile;
            }
            // Use base class to get the all source files other than the input module
            return defaultGetSourceFile(fileName, languageVersion, onError);
        }
        // Override the compileHost getSourceFile() function to get the module source file
        defaultGetSourceFile = this.host.getSourceFile;
        this.host.getSourceFile = getSourceFile;
        var moduleSourceFile = ts.createSourceFile(moduleFileName, input, this.options.target);
        this.program = ts.createProgram([moduleFileName], this.options, this.host);
        return this.emitFiles(this.program, transformers);
    };
    Compiler.prototype.emitFiles = function (program, transformers) {
        var diagnosticsPresent = false;
        var hasEmittedFiles = false;
        var compileStatus = CompileStatus.Success;
        var emitOutput = [];
        var diagnostics = ts.getPreEmitDiagnostics(this.getProgram());
        if (this.options.noEmitOnError && (diagnostics.length > 0)) {
            return new CompileResult(CompileStatus.DiagnosticsPresent_OutputsSkipped, diagnostics);
        }
        if (diagnostics.length > 0) {
            diagnosticsPresent = true;
        }
        var sourceFiles = program.getSourceFiles();
        for (var _i = 0, sourceFiles_1 = sourceFiles; _i < sourceFiles_1.length; _i++) {
            var sourceFile = sourceFiles_1[_i];
            var preEmitDiagnostics = ts.getPreEmitDiagnostics(this.getProgram(), sourceFile);
            if (this.options.noEmitOnError && (preEmitDiagnostics.length > 0)) {
                emitOutput.push({
                    fileName: sourceFile.fileName,
                    emitSkipped: true,
                    diagnostics: preEmitDiagnostics
                });
                continue;
            }
            if (preEmitDiagnostics.length > 0) {
                diagnosticsPresent = true;
            }
            var emitResult = this.fileEmit(sourceFile, transformers);
            if (!emitResult.emitSkipped) {
                hasEmittedFiles = true;
            }
            if (emitResult.diagnostics.length > 0) {
                diagnosticsPresent = true;
            }
            // TODO:
            // TJT: file emit diagnostics should be concatenated?
            emitOutput.push(emitResult);
        }
        if (diagnosticsPresent) {
            if (hasEmittedFiles) {
                compileStatus = CompileStatus.DiagnosticsPresent_OutputsGenerated;
            }
            else {
                compileStatus = CompileStatus.DiagnosticsPresent_OutputsSkipped;
            }
        }
        return new CompileResult(compileStatus, diagnostics, emitOutput);
    };
    Compiler.prototype.fileEmit = function (sourceFile, transformers) {
        var codeFile;
        var mapFile;
        var dtsFile;
        var preEmitDiagnostics = ts.getPreEmitDiagnostics(this.getProgram(), sourceFile);
        if (this.options.noEmitOnError && (preEmitDiagnostics.length > 0)) {
            return {
                fileName: sourceFile.fileName,
                emitSkipped: true,
                diagnostics: preEmitDiagnostics
            };
        }
        var emitResult = this.program.emit(sourceFile, function (fileName, data, writeByteOrderMark) {
            var file = { fileName: fileName, data: data, writeByteOrderMark: writeByteOrderMark };
            if (TsCore.fileExtensionIs(fileName, ".js") || TsCore.fileExtensionIs(fileName, ".jsx")) {
                codeFile = file;
            }
            else if (TsCore.fileExtensionIs(fileName, "d.ts")) {
                dtsFile = file;
            }
            else if (TsCore.fileExtensionIs(fileName, ".map")) {
                mapFile = file;
            }
        }, 
        /*cancellationToken*/ undefined, 
        /*emitOnlyDtsFiles*/ false, transformers ? transformers(this.getProgram()) : undefined);
        return {
            fileName: sourceFile.fileName,
            emitSkipped: emitResult.emitSkipped,
            codeFile: codeFile,
            dtsFile: dtsFile,
            mapFile: mapFile,
            diagnostics: preEmitDiagnostics.concat(emitResult.diagnostics)
        };
    };
    Compiler.prototype.isBuilderProgram = function (program) {
        return program.getProgram !== undefined;
    };
    Compiler.defaultCompileOptions = {
        logLevel: 0,
        verbose: false,
        typeCheckOnly: false
    };
    return Compiler;
}());
exports.Compiler = Compiler;
var CompileStream = /** @class */ (function (_super) {
    __extends(CompileStream, _super);
    function CompileStream(opts) {
        return _super.call(this, { objectMode: true }) || this;
    }
    CompileStream.prototype._read = function () {
        // Safely do nothing
    };
    return CompileStream;
}(stream.Readable));
exports.CompileStream = CompileStream;
var SolutionCompiler = /** @class */ (function () {
    function SolutionCompiler(options, transformers) {
        this.options = options ? options : ts.getDefaultCompilerOptions();
        this.transformers = transformers || undefined;
        this.host = new SolutionBuilderHost(options);
    }
    SolutionCompiler.prototype.getHost = function () {
        return this.host;
    };
    SolutionCompiler.prototype.getProgram = function () {
        return this.program;
    };
    SolutionCompiler.prototype.compile = function (rootProjectNames, cancellationToken) {
        var buildOptions = { verbose: true, force: true };
        var builder = ts.createSolutionBuilder(this.host, rootProjectNames, buildOptions);
        while (true) {
            var invalidatedProject = builder.getNextInvalidatedProject(cancellationToken);
            if (!invalidatedProject) {
                break;
            }
            invalidatedProject.done(cancellationToken);
        }
        return new CompileResult(CompileStatus.Success);
    };
    return SolutionCompiler;
}());
var TsSolutionBuilder;
(function (TsSolutionBuilder) {
    function build(configFilePath, buildOptions) {
        var config = TsCore.getProjectConfig(configFilePath);
        if (config.errors.length > 0) {
            return new CompileResult(CompileStatus.DiagnosticsPresent_OutputsSkipped, config.errors);
        }
        var compiler = new SolutionCompiler(config.options);
        compiler.compile([configFilePath]);
        return new CompileResult(CompileStatus.Success);
    }
    TsSolutionBuilder.build = build;
})(TsSolutionBuilder || (TsSolutionBuilder = {}));
var TsCompiler;
(function (TsCompiler) {
    TsCompiler.version = "4.1.0-dev.2";
    /**
     * Compiles a given array of root file names.
     *
     * @param rootFileNames The root files used to determine the compilation files.
     * @param compilerOptions The {@link ts.CompilerOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    function compileFiles(rootFileNames, compilerOptions, compileOptions, transformers) {
        var compiler = new Compiler();
        return compiler.compileFiles(rootFileNames, compilerOptions, compileOptions, transformers);
    }
    TsCompiler.compileFiles = compileFiles;
    /**
     * Compiles an input string.
     *
     * @param input A string providing the typescript source.
     * @param moduleFileName The module name.
     * @param compilerOptions The {@link ts.CompilerOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    function compileModule(input, moduleFileName, compilerOptions, transformers) {
        var compiler = new Compiler();
        return compiler.compileModule(input, moduleFileName, transformers);
    }
    TsCompiler.compileModule = compileModule;
    /**
     * compiles a project from the provided Typescript configuration file.
     *
     * @param configFilePath A path to the Typescript json configuration file.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    function compileProject(configFilePath, compileOptions, transformers) {
        var compiler = new Compiler();
        return compiler.compileProject(configFilePath, compileOptions, transformers);
    }
    TsCompiler.compileProject = compileProject;
})(TsCompiler = exports.TsCompiler || (exports.TsCompiler = {}));
//# sourceMappingURL=tscompiler.js.map