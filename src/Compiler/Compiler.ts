import * as ts from "typescript"
import { CompileFile } from "./CompileFile"
import { CompileOutput } from "./CompileOutput"
import { CompileResult } from "./CompileResult"
import { CompileStatus } from "./CompileStatus"
import { CompileTransformers } from "./CompileTransformers"
import { CachingCompilerHost } from "./CachingCompilerHost"
import { TsCore } from "../../../TsToolsCommon/src/Utils/TsCore"

export class Compiler {
    private options: ts.CompilerOptions;
    private host: ts.CompilerHost;
    private program: ts.Program;
    private pastProgram: ts.Program;
    private transformers: CompileTransformers;

    constructor( options: ts.CompilerOptions, host?: ts.CompilerHost, pastProgram?: ts.Program, transformers?: CompileTransformers ) {
        this.options = options ? options : ts.getDefaultCompilerOptions();
        this.transformers = transformers || undefined;
        this.host = host || new CachingCompilerHost( options );
        this.pastProgram = pastProgram;
    }

    public getHost(): ts.CompilerHost {
        return this.host;
    }

    public getProgram(): ts.Program {
        return this.program;
    }

    public compile( rootFileNames: ReadonlyArray<string>, oldProgram?: ts.Program ): CompileResult {
        this.program = ts.createProgram( rootFileNames, this.options, this.host, oldProgram );

        return this.emit();
    }

    public compileModule( input: string, moduleFileName: string ): CompileResult {
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

    private emit(): CompileResult {
        var diagnosticsPresent: boolean = false;
        var emitsPresent: boolean = false;
        var compileStatus: CompileStatus = CompileStatus.Success;
        var emitOutput: CompileOutput[] = [];
        var diagnostics = ts.getPreEmitDiagnostics( this.program );

        if ( this.options.noEmitOnError && ( diagnostics.length > 0 ) ) {
            return new CompileResult( CompileStatus.DiagnosticsPresent_OutputsSkipped, diagnostics );
        }

        if ( diagnostics.length > 0 ) {
            diagnosticsPresent = true;
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

            if ( preEmitDiagnostics.length > 0 ) {
                diagnosticsPresent = true;
            }

            var emitResult = this.fileEmit( fileNames[fileNameIndex], sourceFile );

            if ( !emitResult.emitSkipped ) {
                emitsPresent = true;
            }

            if ( emitResult.diagnostics.length > 0 ) {
                diagnosticsPresent = true;
            }

            // TODO:
            // TJT: file emit diagnostics should be concatenated?
            emitOutput.push( emitResult );
        }

        if ( diagnosticsPresent ) {
            if ( emitsPresent ) {
                compileStatus = CompileStatus.DiagnosticsPresent_OutputsGenerated;
            }
            else {
                compileStatus = CompileStatus.DiagnosticsPresent_OutputsSkipped;
            }
        }

        return new CompileResult( compileStatus, diagnostics, emitOutput );
    }

    private fileEmit( fileName: string, sourceFile: ts.SourceFile ): CompileOutput {
        var codeFile: CompileFile;
        var mapFile: CompileFile;
        var dtsFile: CompileFile;

        let preEmitDiagnostics = ts.getPreEmitDiagnostics( this.program, sourceFile );

        if ( this.options.noEmitOnError && ( preEmitDiagnostics.length > 0 ) ) {
            return {
                fileName: fileName,
                emitSkipped: true,
                diagnostics: preEmitDiagnostics
            };
        }

        const emitResult = this.program.emit(
            sourceFile,
            ( fileName: string, data: string, writeByteOrderMark: boolean ) => {
                var file: CompileFile = { fileName: fileName, data: data, writeByteOrderMark: writeByteOrderMark };

                if ( TsCore.fileExtensionIs( fileName, ".js" ) || TsCore.fileExtensionIs( fileName, ".jsx" ) ) {
                    codeFile = file;
                } else if ( TsCore.fileExtensionIs( fileName, "d.ts" ) ) {
                    dtsFile = file;
                } else if ( TsCore.fileExtensionIs( fileName, ".map" ) ) {
                    mapFile = file;
                }
            },
            /*cancellationToken*/ undefined,
            /*emitOnlyDtsFiles*/ false,
            this.transformers ? this.transformers( this.program ) : undefined );

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