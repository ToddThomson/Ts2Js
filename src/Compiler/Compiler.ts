import { CompilerFile } from "./CompilerFile";
import { CompilerOutput } from "./CompilerOutput";
import { CompilerResult } from "./CompilerResult";
import { CachingCompilerHost } from "./CachingCompilerHost";
import { TransformContext } from "../Transform/TransformContext";
import { TransformPlugin } from "../Transform/TransformPlugin";
import { IdentityTransform } from "../Transform/IdentityTransform";
import { TsCore } from "../Utils/TsCore";

import * as ts from "typescript";
import * as path from "path";

export class Compiler {
    private options: ts.CompilerOptions;
    private host: ts.CompilerHost;
    private program: ts.Program;
    private plugin: TransformPlugin;

    private identityTransform: TransformPlugin = new IdentityTransform();
    
    constructor( options: ts.CompilerOptions, plugin?: TransformPlugin, host?: ts.CompilerHost, ) {
        this.options = options? options : ts.getDefaultCompilerOptions();
        this.plugin = plugin || this.identityTransform;
        this.host = host || new CachingCompilerHost( options );
    }

    public getHost(): ts.CompilerHost {
        return this.host;
    }

    public getProgram(): ts.Program {
        return this.program;
    }

    public compile( fileNames: string[] ): CompilerResult {
        this.program = ts.createProgram( fileNames, this.options, this.host, this.program );
        
        return this.emit();
    }

    public compileProgram( program: ts.Program ): CompilerResult {
        this.program = ts.createProgram( program.getRootFileNames(), this.options, this.host, this.program );

        return this.emit()
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

        //const moduleFileName = this.minifierOptions.moduleFileName || ( this.compilerOptions.jsx ? "module.tsx" : "module.ts");
        const moduleSourceFile = ts.createSourceFile( moduleFileName, input, this.options.target );
        
        this.program = ts.createProgram( [moduleFileName], this.options, this.host, this.program );
        
        return this.emit();
    }
    
    private emit(): CompilerResult {
        var emitOutput: CompilerOutput[] = [];
        
        var codeFile: CompilerFile;
        var mapFile: CompilerFile;
        var dtsFile: CompilerFile;

        var allDiagnostics = ts.getPreEmitDiagnostics( this.program );
                    
        if ( this.options.noEmit || ( this.options.noEmitOnError && ( allDiagnostics.length > 0 ) ) ) {
            return { 
                diagnostics: allDiagnostics,
                emitSkipped: true 
            }; 
        }

        const fileNames = this.program.getRootFileNames();

        for ( const fileNameIndex in fileNames ) {
            let sourceFile = this.program.getSourceFile( fileNames[ fileNameIndex ] );
            
            let preEmitDiagnostics = ts.getPreEmitDiagnostics( this.program, sourceFile );

            if ( this.options.noEmitOnError && ( preEmitDiagnostics.length > 0 ) ) {
                emitOutput.push( { 
                    fileName: fileNames[ fileNameIndex ],
                    emitSkipped: true,
                    diagnostics: preEmitDiagnostics } );
                
                continue;
            }

            // Apply transform before emit..

            const context: TransformContext = {
                getHost: () => this.host,
                getProgram: () => this.program
            };

            var transform = this.plugin.transform( context );

            const transformedSourceFile = transform( sourceFile );

            var emitResult = this.fileEmit( fileNames[ fileNameIndex ], transformedSourceFile );

            if ( context.onPostEmit ) {
                context.onPostEmit( emitResult );
            }

            emitOutput.push( emitResult );
        }

        return {
            emitSkipped: false,
            emitOutput: emitOutput,
            diagnostics: allDiagnostics
        }
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
                diagnostics: preEmitDiagnostics };
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
		    });

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
