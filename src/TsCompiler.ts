import * as ts from "typescript"
import { TsCore } from "../../TsToolsCommon/src/Typescript/Core"
import { CachingCompilerHost } from "./Compiler/CachingCompilerHost"
import { Compiler } from "./Compiler/Compiler"
import { CompileFile } from "./Compiler/CompileFile"
import { CompileOutput } from "./Compiler/CompileOutput"
import { CompileResult } from "./Compiler/CompileResult"
import { CompileStatus } from "./Compiler/CompileStatus"
import { CompileStream } from "./Compiler/CompileStream"
import { CompileTransformers } from "./Compiler/CompileTransformers"

// Exported types...
export { CachingCompilerHost }
export { CompileFile }
export { CompileOutput }
export { CompileStatus }
export { CompileResult }
export { CompileStream }
export { CompileTransformers }
export { Compiler }

export namespace TsCompiler {

    /**
     * Compiles a given array of root file names.
     * 
     * @param rootFileNames The root files used to determine the compilation files.
     * @param compilerOptions The {@link ts.CompilerOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult} 
     */
    export function compile( rootFileNames: string[], compilerOptions: ts.CompilerOptions, transformers?: CompileTransformers ): CompileResult {
        const compiler = new Compiler( compilerOptions, /*host*/undefined, /*program*/ undefined, transformers );

        return compiler.compile( rootFileNames );
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
    export function compileModule( input: string, moduleFileName: string, compilerOptions: ts.CompilerOptions, transformers?: CompileTransformers ): CompileResult {
        const compiler = new Compiler( compilerOptions, /*program*/ undefined, /*host*/ undefined, transformers );

        return compiler.compileModule( input, moduleFileName );
    }

    /**
     * compiles a project from the provided Typescript configuration file.
     * 
     * @param configFilePath A path to the Typescript json configuration file.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    export function compileProject( configFilePath: string, transformers?: CompileTransformers ): CompileResult {
        const config = TsCore.getProjectConfig( configFilePath );

        if ( config.errors.length > 0 ) {
            return new CompileResult( CompileStatus.DiagnosticsPresent_OutputsSkipped, config.errors );
        }

        return compile( config.fileNames, config.options, transformers );
    }

    /**
     * A simple wrapper around the Typescript transpile module function.
     * 
     * @param input Typescript source to transpile
     * @param options TranspileOptions to use.
     * @returns A Typescript TranspileOutput object.
     */
    export function transpileModule( input: string, options: ts.TranspileOptions ): ts.TranspileOutput {
        return ts.transpileModule( input, options );
    }
}