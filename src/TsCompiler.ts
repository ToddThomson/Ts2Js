import * as ts from "typescript"

import { ProjectConfig, Project } from "./Project/ProjectConfig"
import { Compiler } from "./Compiler/Compiler"
import { CompilerFile } from "./Compiler/CompilerFile"
import { CompilerOutput } from "./Compiler/CompilerOutput"
import { CompilerResult } from "./Compiler/CompilerResult"
import { TransformPlugin } from "./Transform/TransformPlugin"

// Exported types...
export { CompilerFile }
export { CompilerOutput }
export { CompilerResult }
export { ProjectConfig }

export namespace TsCompiler {

    // TJT: What does this line do?
    exports.TsCompiler.Compiler = Compiler;

    export function compile( fileNames: string[], compilerOptions: ts.CompilerOptions, transform?: TransformPlugin ): CompilerResult {
        const compiler = new Compiler( compilerOptions, transform );

        return compiler.compile( fileNames );
    }

    export function compileModule( input: string, moduleFileName: string, compilerOptions: ts.CompilerOptions, transform?: TransformPlugin ): CompilerResult {
        const compiler = new Compiler( compilerOptions, transform );

        return compiler.compileModule( input, moduleFileName );
    }

    export function compileProgram( program: ts.Program, transform?: TransformPlugin ): CompilerResult {
        const compiler = new Compiler( program.getCompilerOptions(), transform );

        return compiler.compileProgram( program );
    }

    export function compileProject( configFilePath: string, transform?: TransformPlugin ): CompilerResult {
        const config = Project.getProjectConfig( configFilePath );

        return compile( config.fileNames, config.compilerOptions, transform );
    }

    export namespace ProjectHelper {
        export function getProjectConfig( configFilePath: string ): ProjectConfig {
            return Project.getProjectConfig( configFilePath );
        }
    }
}

module.exports = TsCompiler;