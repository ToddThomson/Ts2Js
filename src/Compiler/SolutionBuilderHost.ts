import * as ts from "typescript"
import { CachingCompilerHost } from "./CachingCompilerHost"

/**
 * @description A typescript solution builder host that supports incremental builds and optimizations
 * for file reads and file exists functions.
 * Emit output is saved to memory.
 */
export class SolutionBuilderHost extends CachingCompilerHost implements ts.ProgramHost<ts.EmitAndSemanticDiagnosticsBuilderProgram>
{
    public createProgram: ts.CreateProgram<ts.EmitAndSemanticDiagnosticsBuilderProgram>;
    private diagnostics: ts.Diagnostic[] = [];

    constructor( compilerOptions: ts.CompilerOptions, createProgram?: ts.CreateProgram<ts.EmitAndSemanticDiagnosticsBuilderProgram> )
    {
        super( compilerOptions );

        this.createProgram = createProgram || ts.createEmitAndSemanticDiagnosticsBuilderProgram;
    }

    public deleteFile( fileName: string )
    {
        this.system.deleteFile( fileName );
    }

    public getModifiedTime( fileName: string ): Date
    {
        return this.system.getModifiedTime( fileName );
    }

    public setModifiedTime( fileName: string, date: Date ): void
    {
        this.system.setModifiedTime( fileName, date );
    }

    public reportDiagnostic( diagnostic: ts.Diagnostic )
    {
        this.diagnostics.push( diagnostic );
    }

    public reportSolutionBuilderStatus( diagnostic: ts.Diagnostic )
    {
        this.diagnostics.push( diagnostic );
    }

    public clearDiagnostics()
    {
        this.diagnostics.length = 0;
    }
}