import * as ts from "typescript";
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
declare class CompilerResult {
    private status;
    private readonly errors;
    private readonly output;
    constructor(status: ts.ExitStatus, errors?: ReadonlyArray<ts.Diagnostic>, emitOutput?: CompilerOutput[]);
    getErrors(): ReadonlyArray<ts.Diagnostic>;
    getStatus(): ts.ExitStatus;
    getOutput(): ReadonlyArray<CompilerOutput>;
    succeeded(): boolean;
}
interface TransformPlugins {
    transforms: ts.CustomTransformers;
}
interface ProjectConfig {
    success: boolean;
    compilerOptions?: ts.CompilerOptions;
    fileNames?: string[];
    diagnostics?: ts.Diagnostic[];
}
export { CompilerFile };
export { CompilerOutput };
export { CompilerResult };
export { TransformPlugins };
export { ProjectConfig };
export declare namespace TsCompiler {
    function compile(fileNames: string[], compilerOptions: ts.CompilerOptions, transforms?: TransformPlugins): CompilerResult;
    function compileModule(input: string, moduleFileName: string, compilerOptions: ts.CompilerOptions, transforms?: TransformPlugins): CompilerResult;
    function compileProgram(program: ts.Program, transform?: TransformPlugins): CompilerResult;
    function compileProject(configFilePath: string, transforms?: TransformPlugins): CompilerResult;
    namespace ProjectHelper {
        function getProjectConfig(configFilePath: string): ProjectConfig;
    }
}
