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
    DiagnosticsPresent_OutputsGenerated = 2,
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
declare type CompileTransformers = ((program?: ts.Program) => ts.CustomTransformers | undefined);
declare class CachingCompilerHost implements ts.CompilerHost {
    private output;
    private dirExistsCache;
    private fileExistsCache;
    private fileReadCache;
    protected compilerOptions: ts.CompilerOptions;
    private baseHost;
    constructor(compilerOptions: ts.CompilerOptions);
    getOutput: () => ts.MapLike<string>;
    writeFile: (fileName: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void) => void;
    directoryExists: (directoryPath: string) => boolean;
    fileExists: (fileName: string) => boolean;
    readFile: (fileName: string) => string;
    getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) => ts.SourceFile;
    getDefaultLibFileName: (options: ts.CompilerOptions) => string;
    getCurrentDirectory: () => string;
    getDirectories: (path: string) => string[];
    getCanonicalFileName: (fileName: string) => string;
    useCaseSensitiveFileNames: () => boolean;
    getNewLine: () => string;
}
declare class Compiler {
    private options;
    private host;
    private program;
    private pastProgram;
    private transformers;
    constructor(options: ts.CompilerOptions, host?: ts.CompilerHost, pastProgram?: ts.Program, transformers?: CompileTransformers);
    getHost(): ts.CompilerHost;
    getProgram(): ts.Program;
    compile(rootFileNames: ReadonlyArray<string>, oldProgram?: ts.Program): CompileResult;
    compileModule(input: string, moduleFileName: string): CompileResult;
    private emit();
    private fileEmit(fileName, sourceFile);
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
export { Compiler };
export declare namespace TsCompiler {
    /**
     * Compiles a given array of root file names.
     *
     * @param rootFileNames The root files used to determine the compilation files.
     * @param compilerOptions The {@link ts.CompilerOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    function compile(rootFileNames: string[], compilerOptions: ts.CompilerOptions, transformers?: CompileTransformers): CompileResult;
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
    function compileProject(configFilePath: string, transformers?: CompileTransformers): CompileResult;
    /**
     * A simple wrapper around the Typescript transpile module function.
     *
     * @param input Typescript source to transpile
     * @param options TranspileOptions to use.
     * @returns A Typescript TranspileOutput object.
     */
    function transpileModule(input: string, options: ts.TranspileOptions): ts.TranspileOutput;
}
