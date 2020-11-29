import * as ts from "typescript"
import * as chalk from "chalk"
import { CompileFile } from "./CompileFile"
import { CompileOutput } from "./CompileOutput"
import { CompileResult } from "./CompileResult"
import { CompileStatus } from "./CompileStatus"
import { CompileOptions } from "./CompileOptions"
import { CompileTransformers } from "./CompileTransformers"
import { CompileConfig } from "./CompileConfig"
import { CachingCompilerHost } from "./CachingCompilerHost"
import { StatisticsReporter } from "../../../TsToolsCommon/src/Reporting/StatisticsReporter"
import { Logger } from "../../../TsToolsCommon/src/Reporting/Logger"
import { TsCore } from "../../../TsToolsCommon/src/Typescript/Core"
import { Utils } from "../../../TsToolsCommon/src/Utils/Utilities"

// TJT: Move to common types
interface EmitFilesProgram
{
    getCurrentDirectory(): string;
    getCompilerOptions(): ts.CompilerOptions;
    getSourceFiles(): readonly ts.SourceFile[];
    getSyntacticDiagnostics( sourceFile?: ts.SourceFile, cancellationToken?: ts.CancellationToken ): readonly ts.Diagnostic[];
    getOptionsDiagnostics( cancellationToken?: ts.CancellationToken ): readonly ts.Diagnostic[];
    getGlobalDiagnostics( cancellationToken?: ts.CancellationToken ): readonly ts.Diagnostic[];
    getSemanticDiagnostics( sourceFile?: ts.SourceFile, cancellationToken?: ts.CancellationToken ): readonly ts.Diagnostic[];
    getDeclarationDiagnostics( sourceFile?: ts.SourceFile, cancellationToken?: ts.CancellationToken ): readonly ts.DiagnosticWithLocation[];
    getConfigFileParsingDiagnostics(): readonly ts.Diagnostic[];
    emit( targetSourceFile?: ts.SourceFile, writeFile?: ts.WriteFileCallback, cancellationToken?: ts.CancellationToken, emitOnlyDtsFiles?: boolean, customTransformers?: ts.CustomTransformers ): ts.EmitResult;
    //emitBuildInfo( writeFile?: ts.WriteFileCallback, cancellationToken?: ts.CancellationToken ): ts.EmitResult;
}

export class Compiler
{
    private options: ts.CompilerOptions;
    private host: CachingCompilerHost;
    private program: ts.Program | ts.BuilderProgram; 

    private preEmitTime: number = 0;
    private emitTime: number = 0;
    //private compileTime: number = 0;

    /**
     * The default compile options. 
     */
    public static defaultCompileOptions: CompileOptions = {
        verbose: false,
        typeCheckOnly: false,
        emitToDisk: true
    };

    /**
     * Gets the compiler {@link ts.Program} compilation unit.
     * @returns A {@link ts.Program} or undefined.
     */
    public getProgram(): ts.Program | undefined
    {
        if ( this.isBuilderProgram( this.program ) )
        {
            return this.program.getProgram();
        }
        else
        {
            return this.program;
        }
    }

    /**
     * Compiles a given array of root file names with the supplied options and transformers.
     *
     * @param rootFileNames The root files used to determine the compilation files.
     * @param compilerOptions The {@link ts.CompilerOptions} to use.
     * @param compileOptions The {@link CompileOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    public compileFiles( rootFileNames: string[], compilerOptions: ts.CompilerOptions, compileOptions?: CompileOptions, transformers?: CompileTransformers ): CompileResult
    {
        compileOptions = compileOptions ? Utils.extend( compileOptions, Compiler.defaultCompileOptions ) : Compiler.defaultCompileOptions;

        return this.compile(
            {
                fileNames: rootFileNames,
                options: compilerOptions,
                errors: []
            },
            compileOptions,
            transformers );
    }

    /**
     * Compiles a project from the provided Typescript configuration file path.
     *
     * @param configFilePath A path to the Typescript json configuration file.
     * @param compileOptions The {@link CompileOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
     */
    public compileProject( configFilePath: string, compileOptions?: CompileOptions, transformers?: CompileTransformers ): CompileResult
    {
        compileOptions = compileOptions ? Utils.extend( compileOptions, Compiler.defaultCompileOptions ) : Compiler.defaultCompileOptions;

        const config = TsCore.getProjectConfig( configFilePath );

        if ( config.errors.length > 0 )
        {
            return new CompileResult( CompileStatus.DiagnosticsPresent_OutputsSkipped, config.errors );
        }

        return this.compile( config, compileOptions, transformers );
    }

    /**
    * Compiles an input string with the supplied options and transformers.
    *
    * @param input A string providing the typescript source.
    * @param moduleFileName The module name.
    * @param compilerOptions The {@link ts.CompilerOptions} to use.
    * @param compileOptions The {@link CompileOptions} to use.
    * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
    * @returns A {@link CompileResult}
    */
    public compileModule( input: string, moduleFileName: string, compilerOptions: ts.CompilerOptions, compileOptions: CompileOptions, transformers?: CompileTransformers ): CompileResult
    {
        compileOptions = compileOptions ? Utils.extend( compileOptions, Compiler.defaultCompileOptions ) : Compiler.defaultCompileOptions;

        var defaultGetSourceFile: ( fileName: string, languageVersion: ts.ScriptTarget, onError?: ( message: string ) => void ) => ts.SourceFile;

        function getSourceFile( fileName: string, languageVersion: ts.ScriptTarget, onError?: ( message: string ) => void ): ts.SourceFile {
            if ( fileName === moduleFileName ) {
                return moduleSourceFile;
            }

            // Use base class to get the all source files other than the input module
            return defaultGetSourceFile( fileName, languageVersion, onError );
        }

        this.options = compilerOptions;

        this.host = new CachingCompilerHost( this.options, compileOptions.emitToDisk );

        // Override the compileHost getSourceFile() function to get the module source file
        defaultGetSourceFile = this.host.getSourceFile;
        this.host.getSourceFile = getSourceFile;

        const moduleSourceFile = ts.createSourceFile( moduleFileName, input, this.options.target );

        this.program = ts.createProgram( [moduleFileName], this.options, this.host );

        return this.emit( this.program, transformers );
    }

    /**
     * Compiles from a the provided compile configuration and options.
     * @param config The {@link CompileConfig} to use.
     * @param compileOptions The {@link CompileOptions} to use.
     * @param transformers An optional {@link CompileTransforms} type specifing custom transforms.
     * @returns A {@link CompileResult}
    */
    public compile( config: CompileConfig, compileOptions?: CompileOptions, transformers?: CompileTransformers ): CompileResult
    {
        this.options = config.options;

        // TODO: Review
        // Check for type checking only compile option.
        // NOTE: overriding noEmit should not change the incremental build state.
        //       this needs to be reviewed.
        if ( compileOptions.typeCheckOnly ) {
            this.options.noEmit = true;
        }

        if ( this.options.verbose ) {
            if ( compileOptions.typeCheckOnly ) {
                Logger.log( "Type checking with:" );
            }
            else {
                Logger.log( "Compiling with:" );
            }

            Logger.log( "TypeScript version: ", ts.version );
        }

        this.preEmitTime = new Date().getTime();

        this.host = new CachingCompilerHost( this.options, compileOptions.emitToDisk );

        if ( this.options.Incrementatal ) {
            this.program = ts.createIncrementalProgram(
                {
                    rootNames: config.fileNames,
                    options: this.options,
                    projectReferences: config.projectReferences,
                    host: this.host
                } );
        }
        else {
            this.program = ts.createProgram(
                {
                    rootNames: config.fileNames,
                    options: config.options,
                    host: this.host
                } );
        }
        this.preEmitTime = new Date().getTime() - this.preEmitTime;
        this.emitTime = new Date().getTime();

        let compileResult = this.emit( this.program, transformers );

        this.emitTime = new Date().getTime() - this.emitTime;

        if ( this.options.verbose ) {
            this.reportStatistics();
        }

        return compileResult;
    }

    private emit( program: EmitFilesProgram, transformers?: CompileTransformers ): CompileResult {
        var diagnosticsPresent: boolean = false;
        var hasEmittedFiles: boolean = false;
        var compileStatus: CompileStatus = CompileStatus.Success;
        var emitOutput: CompileOutput[] = [];

        var preEmitDiagnostics = ts.getPreEmitDiagnostics( this.getProgram() );

        if ( preEmitDiagnostics.length > 0 ) {
            diagnosticsPresent = true;
        }

        if ( this.options.noEmitOnError && diagnosticsPresent ) {
            return new CompileResult( CompileStatus.DiagnosticsPresent_OutputsSkipped, preEmitDiagnostics );
        }

        const emitResult = program.emit(
            undefined /* sourceFile */,
            undefined /* writeFile */,
            /*cancellationToken*/ undefined,
            /*emitOnlyDtsFiles*/ false,
            transformers ? transformers( this.getProgram() ) : undefined );

        const diagnostics = ts.sortAndDeduplicateDiagnostics( [...preEmitDiagnostics, ...emitResult.diagnostics] );

        // If the emitter didn't emit anything, then we're done
        if ( emitResult.emitSkipped ) {
            return new CompileResult( CompileStatus.DiagnosticsPresent_OutputsSkipped, diagnostics );
        }

        if ( diagnosticsPresent ) {
            if ( hasEmittedFiles ) {
                compileStatus = CompileStatus.DiagnosticsPresent_OutputsGenerated;
            }
            else {
                compileStatus = CompileStatus.DiagnosticsPresent_OutputsSkipped;
            }
        }

        // Copy the compilation output...
        const fileOutput = this.host.getOutput();

        for ( var fileName in fileOutput ) {
            var fileData = fileOutput[ fileName ];

            var outputFile: CompileOutput = {
                fileName: fileName,
                data: fileData
            };

            emitOutput.push( outputFile );
        }

        return new CompileResult( compileStatus, diagnostics, emitOutput );
    }
    
    private isBuilderProgram( program: ts.Program | ts.BuilderProgram ): program is ts.BuilderProgram
    {
        if ( program )
        {
            return ( program as ts.BuilderProgram ).getProgram !== undefined;
        }

        return false;
    }

    private reportStatistics() {
        let statisticsReporter = new StatisticsReporter();

        statisticsReporter.reportCount( "Files", this.program.getSourceFiles().length );
        statisticsReporter.reportCount( "Lines", this.compiledLines() );
        statisticsReporter.reportTime( "Pre-emit time", this.preEmitTime );
        statisticsReporter.reportTime( "Emit time", this.emitTime );
    }

    private compiledLines(): number {
        var count = 0;
        Utils.forEach( this.program.getSourceFiles(), file => {
            if ( !file.isDeclarationFile ) {
                count += this.getLineStarts( file ).length;
            }
        } );

        return count;
    }

    private getLineStarts( sourceFile: ts.SourceFile ): ReadonlyArray<number> {
        return sourceFile.getLineStarts();
    }
}