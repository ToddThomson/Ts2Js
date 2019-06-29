import * as ts from "typescript"
import { CachingCompilerHost } from "./Compiler/CachingCompilerHost"
import { Compiler } from "./Compiler/Compiler"
import { CompilerFile } from "./Compiler/CompilerFile"
import { CompilerOutput } from "./Compiler/CompilerOutput"
import { CompilerResult } from "./Compiler/CompilerResult"
import { CompileStatus } from "./Compiler/CompileStatus"
import { CompileStream } from "./Compiler/CompileStream"
import { TsCore } from "@TsToolsCommon/Utils/TsCore"

// Exported types...
export { CachingCompilerHost }
export { CompilerFile }
export { CompilerOutput }
export { CompileStatus }
export { CompilerResult }
export { CompileStream }
export { Compiler }

export namespace TsCompiler {
    
    export function compile( rootFileNames: string[], compilerOptions: ts.CompilerOptions, transforms?: ts.CustomTransformers ): CompilerResult {
        const compiler = new Compiler( compilerOptions, /*host*/undefined, /*program*/ undefined, transforms );

        return compiler.compile( rootFileNames );
    }

    export function compileModule( input: string, moduleFileName: string, compilerOptions: ts.CompilerOptions, transforms?: ts.CustomTransformers ): CompilerResult {
        const compiler = new Compiler( compilerOptions, /*program*/ undefined, /*host*/ undefined, transforms );

        return compiler.compileModule( input, moduleFileName );
    }

    export function compileProject( configFilePath: string, transforms?: ts.CustomTransformers ): CompilerResult {
        const config = TsCore.getProjectConfig( configFilePath );

        if ( config.errors.length > 0 ) {
            return new CompilerResult( CompileStatus.DiagnosticsPresent_OutputsSkipped, config.errors );
        }

        return compile( config.fileNames, config.options, transforms );
    }

    export function transpileModule( input: string, options: ts.TranspileOptions ): ts.TranspileOutput {
        return ts.transpileModule( input, options );
    }
}