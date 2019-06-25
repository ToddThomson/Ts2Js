import * as ts from "typescript"

import { ProjectConfig, Project } from "./Project/ProjectConfig"
import { Compiler } from "./Compiler/Compiler"
import { CompilerFile } from "./Compiler/CompilerFile"
import { CompilerOutput } from "./Compiler/CompilerOutput"
import { CompilerResult } from "./Compiler/CompilerResult"
import { CompileStatus } from "./Compiler/CompileStatus"
import { CompileStream } from "./Compiler/CompileStream"

// Exported types...
export { CompilerFile }
export { CompilerOutput }
export { CompileStatus }
export { CompilerResult }
export { CompileStream }
export { ProjectConfig }
export { Compiler }

export namespace TsCompiler {
    // TJT: What does this line do?
    exports.TsCompiler.Compiler = Compiler;

    export function compile( rootFileNames: string[], compilerOptions: ts.CompilerOptions, transforms?: ts.CustomTransformers ): CompilerResult {
        const compiler = new Compiler( compilerOptions, /*host*/undefined, /*program*/ undefined, transforms );

        return compiler.compile( rootFileNames );
    }

    export function compileModule( input: string, moduleFileName: string, compilerOptions: ts.CompilerOptions, transforms?: ts.CustomTransformers ): CompilerResult {
        const compiler = new Compiler( compilerOptions, /*program*/ undefined, /*host*/ undefined, transforms );

        return compiler.compileModule( input, moduleFileName );
    }

    export function compileProject( configFilePath: string, transforms?: ts.CustomTransformers ): CompilerResult {
        const config = Project.getProjectConfig( configFilePath );

        return compile( config.fileNames, config.compilerOptions, transforms );
    }

    export namespace ProjectHelper {
        export function getProjectConfig( configFilePath: string ): ProjectConfig {
            return Project.getProjectConfig( configFilePath );
        }
    }
}

module.exports = TsCompiler;