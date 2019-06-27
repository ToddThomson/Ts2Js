"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var path = require("path");
var stream = require("stream");
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
    function clone(object) {
        var result = {};
        for (var id in object) {
            result[id] = object[id];
        }
        return result;
    }
    Utils.clone = clone;
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
        var sentinal = 1;
        var result = {};
        for (var id in first) {
            result[id] = first[id];
        }
        for (var id in second) {
            if (!hasProperty(result, id)) {
                result[id] = second[id];
            }
        }
        return result;
    }
    Utils.extend = extend;
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
var CompilerResult = (function () {
    function CompilerResult(status, errors, emitOutput) {
        this.status = status;
        this.errors = errors;
    }
    CompilerResult.prototype.getErrors = function () {
        return this.errors;
    };
    CompilerResult.prototype.getStatus = function () {
        return this.status;
    };
    CompilerResult.prototype.getOutput = function () {
        return this.output;
    };
    CompilerResult.prototype.succeeded = function () {
        return (this.status === CompileStatus.Success);
    };
    return CompilerResult;
}());
exports.CompilerResult = CompilerResult;
var CachingCompilerHost = (function () {
    function CachingCompilerHost(compilerOptions) {
        var _this = this;
        this.output = {};
        this.dirExistsCache = {};
        this.fileExistsCache = {};
        this.fileReadCache = {};
        this.getSourceFile = this.getSourceFileImpl;
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
        this.compilerOptions = compilerOptions;
        this.baseHost = ts.createCompilerHost(this.compilerOptions);
    }
    CachingCompilerHost.prototype.getOutput = function () {
        return this.output;
    };
    CachingCompilerHost.prototype.getSourceFileImpl = function (fileName, languageVersion, onError) {
        // Use baseHost to get the source file
        return this.baseHost.getSourceFile(fileName, languageVersion, onError);
    };
    CachingCompilerHost.prototype.writeFile = function (fileName, data, writeByteOrderMark, onError) {
        this.output[fileName] = data;
    };
    CachingCompilerHost.prototype.readFile = function (fileName) {
        if (Utils.hasProperty(this.fileReadCache, fileName)) {
            return this.fileReadCache[fileName];
        }
        return this.fileReadCache[fileName] = this.baseHost.readFile(fileName);
    };
    // Use Typescript CompilerHost "base class" implementation..
    CachingCompilerHost.prototype.getDefaultLibFileName = function (options) {
        return this.baseHost.getDefaultLibFileName(options);
    };
    CachingCompilerHost.prototype.getCurrentDirectory = function () {
        return this.baseHost.getCurrentDirectory();
    };
    CachingCompilerHost.prototype.getDirectories = function (path) {
        return this.baseHost.getDirectories(path);
    };
    CachingCompilerHost.prototype.getCanonicalFileName = function (fileName) {
        return this.baseHost.getCanonicalFileName(fileName);
    };
    CachingCompilerHost.prototype.useCaseSensitiveFileNames = function () {
        return this.baseHost.useCaseSensitiveFileNames();
    };
    CachingCompilerHost.prototype.getNewLine = function () {
        return this.baseHost.getNewLine();
    };
    CachingCompilerHost.prototype.directoryExists = function (directoryPath) {
        if (Utils.hasProperty(this.dirExistsCache, directoryPath)) {
            return this.dirExistsCache[directoryPath];
        }
        return this.dirExistsCache[directoryPath] = ts.sys.directoryExists(directoryPath);
    };
    return CachingCompilerHost;
}());
exports.CachingCompilerHost = CachingCompilerHost;
var TsCore;
(function (TsCore) {
    function fileExtensionIs(path, extension) {
        var pathLen = path.length;
        var extLen = extension.length;
        return pathLen > extLen && path.substr(pathLen - extLen, extLen) === extension;
    }
    TsCore.fileExtensionIs = fileExtensionIs;
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
    function getSourceFileOfNode(node) {
        while (node && node.kind !== ts.SyntaxKind.SourceFile) {
            node = node.parent;
        }
        return node;
    }
    TsCore.getSourceFileOfNode = getSourceFileOfNode;
    function getSourceFileFromSymbol(symbol) {
        var declarations = symbol.getDeclarations();
        if (declarations && declarations.length > 0) {
            if (declarations[0].kind === ts.SyntaxKind.SourceFile) {
                return declarations[0].getSourceFile();
            }
        }
        return undefined;
    }
    TsCore.getSourceFileFromSymbol = getSourceFileFromSymbol;
    function getExternalModuleName(node) {
        if (node.kind === ts.SyntaxKind.ImportDeclaration) {
            return node.moduleSpecifier;
        }
        if (node.kind === ts.SyntaxKind.ImportEqualsDeclaration) {
            var reference = node.moduleReference;
            if (reference.kind === ts.SyntaxKind.ExternalModuleReference) {
                return reference.expression;
            }
        }
        if (node.kind === ts.SyntaxKind.ExportDeclaration) {
            return node.moduleSpecifier;
        }
        return undefined;
    }
    TsCore.getExternalModuleName = getExternalModuleName;
    function createDiagnostic(message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // FUTURE: Typescript 1.8.x supports localized diagnostic messages.
        var textUnique123 = message.message;
        if (arguments.length > 1) {
            textUnique123 = formatStringFromArgs(textUnique123, arguments, 1);
        }
        return {
            file: undefined,
            start: undefined,
            length: undefined,
            messageText: textUnique123,
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
    // An alias symbol is created by one of the following declarations:
    // import <symbol> = ...
    // import <symbol> from ...
    // import * as <symbol> from ...
    // import { x as <symbol> } from ...
    // export { x as <symbol> } from ...
    // export = ...
    // export default ...
    function isAliasSymbolDeclaration(node) {
        return node.kind === ts.SyntaxKind.ImportEqualsDeclaration ||
            node.kind === ts.SyntaxKind.ImportClause && !!node.name ||
            node.kind === ts.SyntaxKind.NamespaceImport ||
            node.kind === ts.SyntaxKind.ImportSpecifier ||
            node.kind === ts.SyntaxKind.ExportSpecifier ||
            node.kind === ts.SyntaxKind.ExportAssignment && node.expression.kind === ts.SyntaxKind.Identifier;
    }
    TsCore.isAliasSymbolDeclaration = isAliasSymbolDeclaration;
    function normalizeSlashes(path) {
        return path.replace(/\\/g, "/");
    }
    TsCore.normalizeSlashes = normalizeSlashes;
    function outputExtension(path) {
        return path.replace(/\.ts/, ".js");
    }
    TsCore.outputExtension = outputExtension;
})(TsCore || (TsCore = {}));
var Compiler = (function () {
    function Compiler(options, host, program, transforms) {
        this.options = options ? options : ts.getDefaultCompilerOptions();
        this.transforms = transforms;
        this.host = host || new CachingCompilerHost(options);
        this.program = program;
    }
    Compiler.prototype.getHost = function () {
        return this.host;
    };
    Compiler.prototype.getProgram = function () {
        return this.program;
    };
    Compiler.prototype.compile = function (rootFileNames, oldProgram) {
        this.program = ts.createProgram(rootFileNames, this.options, this.host, oldProgram);
        return this.emit();
    };
    Compiler.prototype.compileModule = function (input, moduleFileName) {
        var defaultGetSourceFile;
        function getSourceFile(fileName, languageVersion, onError) {
            if (fileName === moduleFileName) {
                return moduleSourceFile;
            }
            // Use base class to get the all source files other than the module
            return defaultGetSourceFile(fileName, languageVersion, onError);
        }
        // Override the compileHost getSourceFile() function to get the module source file
        defaultGetSourceFile = this.host.getSourceFile;
        this.host.getSourceFile = getSourceFile;
        //const moduleFileName = this.minifierOptions.moduleFileName || ( this.compilerOptions.jsx ? "module.tsx" : "module.ts");
        var moduleSourceFile = ts.createSourceFile(moduleFileName, input, this.options.target);
        this.program = ts.createProgram([moduleFileName], this.options, this.host, this.program);
        return this.emit();
    };
    Compiler.prototype.emit = function () {
        var emitOutput = [];
        var diagnostics = ts.getPreEmitDiagnostics(this.program);
        if (this.options.noEmitOnError && (diagnostics.length > 0)) {
            return new CompilerResult(CompileStatus.DiagnosticsPresent_OutputsSkipped, diagnostics);
        }
        var fileNames = this.program.getRootFileNames();
        for (var fileNameIndex in fileNames) {
            var sourceFile = this.program.getSourceFile(fileNames[fileNameIndex]);
            var preEmitDiagnostics = ts.getPreEmitDiagnostics(this.program, sourceFile);
            if (this.options.noEmitOnError && (preEmitDiagnostics.length > 0)) {
                emitOutput.push({
                    fileName: fileNames[fileNameIndex],
                    emitSkipped: true,
                    diagnostics: preEmitDiagnostics
                });
                continue;
            }
            var emitResult = this.fileEmit(fileNames[fileNameIndex], sourceFile);
            emitOutput.push(emitResult);
        }
        return new CompilerResult(CompileStatus.Success, diagnostics, emitOutput);
    };
    Compiler.prototype.fileEmit = function (fileName, sourceFile) {
        var codeFile;
        var mapFile;
        var dtsFile;
        var preEmitDiagnostics = ts.getPreEmitDiagnostics(this.program, sourceFile);
        if (this.options.noEmitOnError && (preEmitDiagnostics.length > 0)) {
            return {
                fileName: fileName,
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
        }, /*cancellationToken*/ undefined, /*emitOnlyDtsFiles*/ false, this.transforms);
        return {
            fileName: fileName,
            emitSkipped: emitResult.emitSkipped,
            codeFile: codeFile,
            dtsFile: dtsFile,
            mapFile: mapFile,
            diagnostics: preEmitDiagnostics.concat(emitResult.diagnostics)
        };
    };
    return Compiler;
}());
exports.Compiler = Compiler;
var CompileStream = (function (_super) {
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
var TsCompiler;
(function (TsCompiler) {
    // TJT: What does this line do?
    exports.TsCompiler.Compiler = Compiler;
    function compile(rootFileNames, compilerOptions, transforms) {
        var compiler = new Compiler(compilerOptions, /*host*/ undefined, /*program*/ undefined, transforms);
        return compiler.compile(rootFileNames);
    }
    TsCompiler.compile = compile;
    function compileModule(input, moduleFileName, compilerOptions, transforms) {
        var compiler = new Compiler(compilerOptions, /*program*/ undefined, /*host*/ undefined, transforms);
        return compiler.compileModule(input, moduleFileName);
    }
    TsCompiler.compileModule = compileModule;
})(TsCompiler = exports.TsCompiler || (exports.TsCompiler = {}));
//# sourceMappingURL=tscompiler.js.map