import * as ts from "typescript";
interface CompileOutput {
    fileName: string;
    data: string;
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
     * Sets verbose output. Defaults to false.
     */
    verbose?: boolean;
    /**
     * Sets type checking only with no output files emitted. Defaults to false.
     */
    typeCheckOnly?: boolean;
    /**
    * Sets emit output to disk. Defaults to true.
    */
    emitToDisk?: boolean;
}
declare type CompileTransformers = ((program?: ts.Program) => ts.CustomTransformers | undefined);
interface CompileConfig {
    fileNames: string[];
    options: ts.CompilerOptions;
    projectReferences?: readonly ts.ProjectReference[];
    errors: ts.Diagnostic[];
}
declare class Compiler {
    private options;
    private host;
    private program;
    private preEmitTime;
    private emitTime;
    /**
     * The default compile options.
     */
    static defaultCompileOptions: CompileOptions;
    /**
     * Gets the compiler {@link ts.Program} compilation unit.
     * @returns A {@link ts.Program} or undefined.
     */
    getProgram(): ts.Program | undefined;
    /**
     * Compiles a given array of root file names with the supplied options and transformers.
     *
     * @param rootFileNames The root files used to determine the compilation files.
     * @param compilerOptions The {@link ts.CompilerOptions} to use.
     * @param compileOptions The {@link CompileOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    compileFiles(rootFileNames: string[], compilerOptions: ts.CompilerOptions, compileOptions?: CompileOptions, transformers?: CompileTransformers): CompileResult;
    /**
     * Compiles a project from the provided Typescript configuration file path.
     *
     * @param configFilePath A path to the Typescript json configuration file.
     * @param compileOptions The {@link CompileOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    compileProject(configFilePath: string, compileOptions?: CompileOptions, transformers?: CompileTransformers): CompileResult;
    /**
    * Compiles an input string with the supplied options and transformers.
    *
    * @param input A string providing the typescript source.
    * @param moduleFileName The module name.
    * @param compilerOptions The {@link ts.CompilerOptions} to use.
    * @param compileOptions The {@link CompileOptions} to use.
    * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
    * @returns A {@link CompileResult}
    */
    compileModule(input: string, moduleFileName: string, compilerOptions: ts.CompilerOptions, compileOptions: CompileOptions, transformers?: CompileTransformers): CompileResult;
    /**
     * Compiles from a the provided compile configuration and options.
     * @param config The {@link CompileConfig} to use.
     * @param compileOptions The {@link CompileOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
    */
    compile(config: CompileConfig, compileOptions?: CompileOptions, transformers?: CompileTransformers): CompileResult;
    private emit;
    private isBuilderProgram;
    private reportStatistics;
    private compiledLines;
    private getLineStarts;
}
export { CompileOutput };
export { CompileStatus };
export { CompileResult };
export { CompileTransformers };
export { CompileConfig };
export { CompileOptions };
export { Compiler };
export declare namespace TsCompiler {
    const version = "4.1.0-dev.5";
    /**
     * Compiles a given array of root file names with the supplied options and transformers.
     *
     * @param rootFileNames The root files used to determine the compilation files.
     * @param compilerOptions The {@link ts.CompilerOptions} to use.
     * @param compileOptions The {@link CompileOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    function compileFiles(rootFileNames: string[], compilerOptions: ts.CompilerOptions, compileOptions?: CompileOptions, transformers?: CompileTransformers): CompileResult;
    /**
     * Compiles an input string with the supplied options and transformers.
     *
     * @param input A string providing the typescript source.
     * @param moduleFileName The module name.
     * @param compilerOptions The {@link ts.CompilerOptions} to use.
     * @param compileOptions The {@link CompileOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    function compileModule(input: string, moduleFileName: string, compilerOptions: ts.CompilerOptions, compileOptions: CompileOptions, transformers?: CompileTransformers): CompileResult;
    /**
     * Compiles a project from the provided Typescript configuration file.
     *
     * @param configFilePath A path to the Typescript json configuration file.
     * @param compileOptions The {@link CompileOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    function compileProject(configFilePath: string, compileOptions?: CompileOptions, transformers?: CompileTransformers): CompileResult;
}
