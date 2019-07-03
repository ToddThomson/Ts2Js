import * as ts from "typescript"
import { expect } from "chai"
import { TsCompiler, CompileResult, CompileStatus } from "../../../lib/TsCompiler"

describe( "compile()", () => {

    function compilesSuccessfully( name: string, fileName: string, options: ts.CompilerOptions, transformers?: ts.CustomTransformers ) {
        describe( name, () => {
            let compileResult = TsCompiler.compile( [fileName], options, transformers );

            it( "completes with status is successful", () => {
                expect( compileResult.getStatus() ).to.equal( CompileStatus.Success );
            } );
        } );
    }

    function compilesWithErrors( name: string, fileName: string, options: ts.CompilerOptions, transformers?: ts.CustomTransformers ) {
        describe( name, () => {
            let compileResult = TsCompiler.compile( [fileName], options, transformers );

            it( "completes with diagnostics", () => {
                expect( compileResult.getStatus() ).to.not.equal( CompileStatus.Success );
                expect( compileResult.getErrors() ).to.have.length.greaterThan( 0 );
            } );
        } );
    }

    compilesSuccessfully(
        "file exits with valid source",
        "./tests/projects/simple/main.ts",
        { module: ts.ModuleKind.CommonJS }
    );

    compilesWithErrors(
        "file does not exit",
        "anonexistentfile.ts",
        { module: ts.ModuleKind.CommonJS }
    );
} );