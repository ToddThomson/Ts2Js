import * as ts from "typescript"
import { TsCore } from "../../TsToolsCommon/src/Utils/TsCore"
import { CachingCompilerHost } from "./Compiler/CachingCompilerHost"
import { Compiler } from "./Compiler/Compiler"
import { CompileFile } from "./Compiler/CompileFile"
import { CompileOutput } from "./Compiler/CompileOutput"
import { CompileResult } from "./Compiler/CompileResult"
import { CompileStatus } from "./Compiler/CompileStatus"
import { CompileStream } from "./Compiler/CompileStream"

// Exported types...
export { CachingCompilerHost }
export { CompileFile }
export { CompileOutput }
export { CompileStatus }
export { CompileResult }
export { CompileStream }
export { Compiler }

export namespace TsCompiler {
    
    export function compile( rootFileNames: string[], compilerOptions: ts.CompilerOptions, transforms?: ts.CustomTransformers ): CompileResult {
        const compiler = new Compiler( compilerOptions, /*host*/undefined, /*program*/ undefined, transforms );

        return compiler.compile( rootFileNames );
    }

    export function compileModule( input: string, moduleFileName: string, compilerOptions: ts.CompilerOptions, transforms?: ts.CustomTransformers ): CompileResult {
        const compiler = new Compiler( compilerOptions, /*program*/ undefined, /*host*/ undefined, transforms );

        return compiler.compileModule( input, moduleFileName );
    }

    export function compileProject( configFilePath: string, transforms?: ts.CustomTransformers ): CompileResult {
        const config = TsCore.getProjectConfig( configFilePath );

        if ( config.errors.length > 0 ) {
            return new CompileResult( CompileStatus.DiagnosticsPresent_OutputsSkipped, config.errors );
        }

        return compile( config.fileNames, config.options, transforms );
    }

    export function transpileModule( input: string, options: ts.TranspileOptions ): ts.TranspileOutput {
        return ts.transpileModule( input, options );
    }
}