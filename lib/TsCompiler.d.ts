/// <reference types="node" />
import * as ts from "typescript";
import * as stream from "stream";
interface CompileFile {
    fileName: string;
    data: string;
    writeByteOrderMark: boolean;
}
interface CompileOutput {
    fileName: string;
    emitSkipped: boolean;
    diagnostics?: ReadonlyArray<ts.Diagnostic>;
    codeFile?: CompileFile;
    dtsFile?: CompileFile;
    mapFile?: CompileFile;
}
declare enum CompileStatus {
    Success = 0,
    DiagnosticsPresent_OutputsSkipped = 1,
    DiagnosticsPresent_OutputsGenerated = 2
}
declare class CompileResult {
    private status;
    private readonly errors;
    private readonly output;
    constructor(status: CompileStatus, errors?: ReadonlyArray<ts.Diagnostic>, emitOutput?: CompileOutput[]);
    getErrors(): ReadonlyArray<ts.Diagnostic>;
    getStatus(): CompileStatus;
    getOutput(): ReadonlyArray<CompileOutput>;
    succeeded(): boolean;
}
interface CompileOptions {
    /**
     * Sets log level. Defaults to 0
     */
    logLevel?: number;
    /**
     * Sets verbose output. Defaults to false.
     */
    verbose?: boolean;
    /**
     * Sets type checking only with no output files emitted. Defaults to false.
     */
    typeCheckOnly?: boolean;
}
declare type CompileTransformers = ((program?: ts.Program) => ts.CustomTransformers | undefined);
declare class CachingCompilerHost implements ts.CompilerHost {
    protected system: ts.System;
    private output;
    private dirExistsCache;
    private fileExistsCache;
    private fileReadCache;
    protected compilerOptions: ts.CompilerOptions;
    protected baseHost: ts.CompilerHost;
    constructor(compilerOptions: ts.CompilerOptions);
    getOutput: () => ts.MapLike<string>;
    readFile: (fileName: string) => string;
    writeFile: (fileName: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void) => void;
    directoryExists: (directoryPath: string) => boolean;
    fileExists: (fileName: string) => boolean;
    getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) => ts.SourceFile;
    getDefaultLibFileName: (options: ts.CompilerOptions) => string;
    getCurrentDirectory: () => string;
    getDirectories: (path: string) => string[];
    getCanonicalFileName: (fileName: string) => string;
    useCaseSensitiveFileNames: () => boolean;
    getNewLine: () => string;
    readDirectory(rootDir: string, extensions?: ReadonlyArray<string>, exclude?: ReadonlyArray<string>, include?: ReadonlyArray<string>, depth?: number): string[];
    protected isBuildInfoFile(file: string): boolean;
}
declare class Compiler {
    private options;
    private host;
    private program;
    getProgram(): ts.Program | null;
    static defaultCompileOptions: CompileOptions;
    compileFiles(rootFileNames: ReadonlyArray<string>, compilerOptions: ts.CompilerOptions, compileOptions?: CompileOptions, transformers?: CompileTransformers): CompileResult;
    compileProject(configFilePath: string, compileOptions?: CompileOptions, transformers?: CompileTransformers): CompileResult;
    compileModule(input: string, moduleFileName: string, transformers?: CompileTransformers): CompileResult;
    private emitFiles;
    private fileEmit;
    private isBuilderProgram;
}
declare class CompileStream extends stream.Readable {
    constructor(opts?: stream.ReadableOptions);
    _read(): void;
}
export { CachingCompilerHost };
export { CompileFile };
export { CompileOutput };
export { CompileStatus };
export { CompileResult };
export { CompileStream };
export { CompileTransformers };
export { CompileOptions };
export { Compiler };
export declare namespace TsCompiler {
    const version = "4.1.0-dev.2";
    /**
     * Compiles a given array of root file names.
     *
     * @param rootFileNames The root files used to determine the compilation files.
     * @param compilerOptions The {@link ts.CompilerOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    function compileFiles(rootFileNames: string[], compilerOptions: ts.CompilerOptions, compileOptions?: CompileOptions, transformers?: CompileTransformers): CompileResult;
    /**
     * Compiles an input string.
     *
     * @param input A string providing the typescript source.
     * @param moduleFileName The module name.
     * @param compilerOptions The {@link ts.CompilerOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    function compileModule(input: string, moduleFileName: string, compilerOptions: ts.CompilerOptions, transformers?: CompileTransformers): CompileResult;
    /**
     * compiles a project from the provided Typescript configuration file.
     *
     * @param configFilePath A path to the Typescript json configuration file.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    function compileProject(configFilePath: string, compileOptions?: CompileOptions, transformers?: CompileTransformers): CompileResult;
}
