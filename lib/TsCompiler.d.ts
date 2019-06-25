import * as ts from "typescript";
import * as stream from "stream";
interface CompilerFile {
    fileName: string;
    data: string;
    writeByteOrderMark: boolean;
}
interface CompilerOutput {
    fileName: string;
    emitSkipped: boolean;
    diagnostics?: ReadonlyArray<ts.Diagnostic>;
    codeFile?: CompilerFile;
    dtsFile?: CompilerFile;
    mapFile?: CompilerFile;
}
declare enum CompileStatus {
    Success = 0,
    DiagnosticsPresent_OutputsSkipped = 1,
    DiagnosticsPresent_OutputsGenerated = 2,
}
declare class CompilerResult {
    private status;
    private readonly errors;
    private readonly output;
    constructor(status: CompileStatus, errors?: ReadonlyArray<ts.Diagnostic>, emitOutput?: CompilerOutput[]);
    getErrors(): ReadonlyArray<ts.Diagnostic>;
    getStatus(): CompileStatus;
    getOutput(): ReadonlyArray<CompilerOutput>;
    succeeded(): boolean;
}
interface ProjectConfig {
    success: boolean;
    compilerOptions?: ts.CompilerOptions;
    fileNames?: string[];
    diagnostics?: ts.Diagnostic[];
}
declare class Compiler {
    private options;
    private host;
    private program;
    private transforms;
    constructor(options: ts.CompilerOptions, host?: ts.CompilerHost, program?: ts.Program, transforms?: ts.CustomTransformers);
    getHost(): ts.CompilerHost;
    getProgram(): ts.Program;
    compile(rootFileNames: ReadonlyArray<string>, oldProgram?: ts.Program): CompilerResult;
    compileModule(input: string, moduleFileName: string): CompilerResult;
    private emit();
    private fileEmit(fileName, sourceFile);
}
declare class CompileStream extends stream.Readable {
    constructor(opts?: stream.ReadableOptions);
    _read(): void;
}
export { CompilerFile };
export { CompilerOutput };
export { CompileStatus };
export { CompilerResult };
export { CompileStream };
export { ProjectConfig };
export { Compiler };
export declare namespace TsCompiler {
    function compile(rootFileNames: string[], compilerOptions: ts.CompilerOptions, transforms?: ts.CustomTransformers): CompilerResult;
    function compileModule(input: string, moduleFileName: string, compilerOptions: ts.CompilerOptions, transforms?: ts.CustomTransformers): CompilerResult;
    function compileProject(configFilePath: string, transforms?: ts.CustomTransformers): CompilerResult;
    namespace ProjectHelper {
        function getProjectConfig(configFilePath: string): ProjectConfig;
    }
}
