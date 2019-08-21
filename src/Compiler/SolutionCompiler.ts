import * as ts from "typescript"
import { CompileFile } from "./CompileFile"
import { CompileOutput } from "./CompileOutput"
import { CompileResult } from "./CompileResult"
import { CompileStatus } from "./CompileStatus"
import { CompileTransformers } from "./CompileTransformers"
import { SolutionBuilderHost } from "./SolutionBuilderHost"
import { TsCore } from "../../../TsToolsCommon/src/Typescript/Core"

export class SolutionCompiler {
    private options: ts.CompilerOptions;
    private host: SolutionBuilderHost;
    private program: ts.EmitAndSemanticDiagnosticsBuilderProgram;
    private transformers: CompileTransformers;

    constructor( options: ts.CompilerOptions, transformers?: CompileTransformers )
    {
        this.options = options ? options : ts.getDefaultCompilerOptions();
        this.transformers = transformers || undefined;
        this.host = new SolutionBuilderHost( options );
    }

    public getHost(): SolutionBuilderHost {
        return this.host;
    }

    public getProgram(): ts.EmitAndSemanticDiagnosticsBuilderProgram {
        return this.program;
    }

    public compile( rootProjectNames: ReadonlyArray<string>, cancellationToken?: ts.CancellationToken ): CompileResult
    {
        let buildOptions: ts.BuildOptions = { verbose: true, force: true };
        const builder = ts.createSolutionBuilder( this.host, rootProjectNames, buildOptions );
        
        while ( true )
        {
            const invalidatedProject = builder.getNextInvalidatedProject( cancellationToken );

            if ( !invalidatedProject )
            {
                break;
            }

            invalidatedProject.done( cancellationToken );
        }

        return new CompileResult( CompileStatus.Success );
    }
}