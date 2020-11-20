import * as ts from "typescript"
import { TsCore } from "../../TsToolsCommon/src/Typescript/Core"
import { CachingCompilerHost } from "./Compiler/CachingCompilerHost"
import { Compiler } from "./Compiler/Compiler"
import { CompileFile } from "./Compiler/CompileFile"
import { CompileOptions } from "./Compiler/CompileOptions"
import { CompileOutput } from "./Compiler/CompileOutput"
import { CompileResult } from "./Compiler/CompileResult"
import { CompileStatus } from "./Compiler/CompileStatus"
import { CompileStream } from "./Compiler/CompileStream"
import { CompileTransformers } from "./Compiler/CompileTransformers"
import { SolutionBuilderHost } from "./Compiler/SolutionBuilderHost"
import { SolutionCompiler } from "./Compiler/SolutionCompiler";

// Exported types...
export { CachingCompilerHost }
export { CompileFile }
export { CompileOutput }
export { CompileStatus }
export { CompileResult }
export { CompileStream }
export { CompileTransformers }
export { CompileOptions }
export { Compiler };

export namespace TsSolutionBuilder
{
    export function build( configFilePath: string, buildOptions: ts.BuildOptions )
    {
        const config = TsCore.getProjectConfig( configFilePath );

        if ( config.errors.length > 0 )
        {
            return new CompileResult( CompileStatus.DiagnosticsPresent_OutputsSkipped, config.errors );
        }

        const compiler = new SolutionCompiler( config.options );
        compiler.compile( [configFilePath] );

        return new CompileResult( CompileStatus.Success );
    }
}

export namespace TsCompiler
{
    export const version = "4.1.0-dev.2";

    /**
     * Compiles a given array of root file names.
     * 
     * @param rootFileNames The root files used to determine the compilation files.
     * @param compilerOptions The {@link ts.CompilerOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult} 
     */
    export function compileFiles( rootFileNames: string[], compilerOptions: ts.CompilerOptions, compileOptions?: CompileOptions,  transformers?: CompileTransformers ): CompileResult
    {
        const compiler = new Compiler();

        return compiler.compileFiles( rootFileNames, compilerOptions, compileOptions, transformers );
    }

    /**
     * Compiles an input string.
     * 
     * @param input A string providing the typescript source.
     * @param moduleFileName The module name.
     * @param compilerOptions The {@link ts.CompilerOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    export function compileModule( input: string, moduleFileName: string, compilerOptions: ts.CompilerOptions, transformers?: CompileTransformers ): CompileResult
    {
        const compiler = new Compiler();

        return compiler.compileModule( input, moduleFileName, transformers );
    }

    /**
     * compiles a project from the provided Typescript configuration file.
     * 
     * @param configFilePath A path to the Typescript json configuration file.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    export function compileProject( configFilePath: string, compileOptions?: CompileOptions, transformers?: CompileTransformers ): CompileResult
    {
        const compiler = new Compiler();

        return compiler.compileProject( configFilePath, compileOptions, transformers );
    }
}