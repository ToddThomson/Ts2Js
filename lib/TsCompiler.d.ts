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
    private transforms;
    constructor(options: ts.CompilerOptions, host?: ts.CompilerHost, program?: ts.Program, transforms?: ts.CustomTransformers);
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
export { Compiler };
export declare namespace TsCompiler {
    function compile(rootFileNames: string[], compilerOptions: ts.CompilerOptions, transforms?: ts.CustomTransformers): CompileResult;
    function compileModule(input: string, moduleFileName: string, compilerOptions: ts.CompilerOptions, transforms?: ts.CustomTransformers): CompileResult;
    function compileProject(configFilePath: string, transforms?: ts.CustomTransformers): CompileResult;
    function transpileModule(input: string, options: ts.TranspileOptions): ts.TranspileOutput;
}
