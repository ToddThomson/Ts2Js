import * as ts from "typescript";
import { CompilerFile } from "./CompilerFile";
import { CompilerOutput } from "./CompilerOutput";
import { CompilerResult } from "./CompilerResult";
import { CompileStatus } from "./CompileStatus";
import { CachingCompilerHost } from "./CachingCompilerHost";
import { TsCore } from "@TsToolsCommon/Utils/TsCore";

export class Compiler {
    private options: ts.CompilerOptions;
    private host: ts.CompilerHost;
    private program: ts.Program;
    private transforms: ts.CustomTransformers;

    constructor( options: ts.CompilerOptions, host?: ts.CompilerHost, program?: ts.Program, transforms?: ts.CustomTransformers ) {
        this.options = options ? options : ts.getDefaultCompilerOptions();
        this.transforms = transforms;
        this.host = host || new CachingCompilerHost( options );
        this.program = program;
    }

    public getHost(): ts.CompilerHost {
        return this.host;
    }

    public getProgram(): ts.Program {
        return this.program;
    }

    public compile( rootFileNames: ReadonlyArray<string>, oldProgram?: ts.Program ): CompilerResult {
        this.program = ts.createProgram( rootFileNames, this.options, this.host, oldProgram );

        return this.emit();
    }

    public compileModule( input: string, moduleFileName: string ): CompilerResult {
        var defaultGetSourceFile: ( fileName: string, languageVersion: ts.ScriptTarget, onError?: ( message: string ) => void ) => ts.SourceFile;

        function getSourceFile( fileName: string, languageVersion: ts.ScriptTarget, onError?: ( message: string ) => void ): ts.SourceFile {
            if ( fileName === moduleFileName ) {
                return moduleSourceFile;
            }

            // Use base class to get the all source files other than the module
            return defaultGetSourceFile( fileName, languageVersion, onError );
        }

        // Override the compileHost getSourceFile() function to get the module source file
        defaultGetSourceFile = this.host.getSourceFile;
        this.host.getSourceFile = getSourceFile;

        const moduleSourceFile = ts.createSourceFile( moduleFileName, input, this.options.target );

        this.program = ts.createProgram( [moduleFileName], this.options, this.host, this.program );

        return this.emit();
    }

    private emit(): CompilerResult {
        var emitOutput: CompilerOutput[] = [];
        var diagnostics = ts.getPreEmitDiagnostics( this.program );

        if ( this.options.noEmitOnError && ( diagnostics.length > 0 ) ) {
            return new CompilerResult( CompileStatus.DiagnosticsPresent_OutputsSkipped, diagnostics );
        }

        const fileNames = this.program.getRootFileNames();

        for ( const fileNameIndex in fileNames ) {
            let sourceFile = this.program.getSourceFile( fileNames[fileNameIndex] );

            let preEmitDiagnostics = ts.getPreEmitDiagnostics( this.program, sourceFile );

            if ( this.options.noEmitOnError && ( preEmitDiagnostics.length > 0 ) ) {
                emitOutput.push( {
                    fileName: fileNames[fileNameIndex],
                    emitSkipped: true,
                    diagnostics: preEmitDiagnostics
                } );

                continue;
            }

            var emitResult = this.fileEmit( fileNames[fileNameIndex], sourceFile );

            emitOutput.push( emitResult );
        }

        return new CompilerResult( CompileStatus.Success, diagnostics, emitOutput );
    }

    private fileEmit( fileName: string, sourceFile: ts.SourceFile ): CompilerOutput {
        var codeFile: CompilerFile;
        var mapFile: CompilerFile;
        var dtsFile: CompilerFile;

        let preEmitDiagnostics = ts.getPreEmitDiagnostics( this.program, sourceFile );

        if ( this.options.noEmitOnError && ( preEmitDiagnostics.length > 0 ) ) {
            return {
                fileName: fileName,
                emitSkipped: true,
                diagnostics: preEmitDiagnostics
            };
        }

        const emitResult = this.program.emit( sourceFile, ( fileName: string, data: string, writeByteOrderMark: boolean ) => {
            var file: CompilerFile = { fileName: fileName, data: data, writeByteOrderMark: writeByteOrderMark };

            if ( TsCore.fileExtensionIs( fileName, ".js" ) || TsCore.fileExtensionIs( fileName, ".jsx" ) ) {
                codeFile = file;
            } else if ( TsCore.fileExtensionIs( fileName, "d.ts" ) ) {
                dtsFile = file;
            } else if ( TsCore.fileExtensionIs( fileName, ".map" ) ) {
                mapFile = file;
            }
        }, /*cancellationToken*/ undefined, /*emitOnlyDtsFiles*/ false, this.transforms );

        return {
            fileName: fileName,
            emitSkipped: emitResult.emitSkipped,
            codeFile: codeFile,
            dtsFile: dtsFile,
            mapFile: mapFile,
            diagnostics: preEmitDiagnostics.concat( emitResult.diagnostics as ts.Diagnostic[] )
        };
    }
}