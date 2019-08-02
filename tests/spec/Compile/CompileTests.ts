import * as ts from "typescript"
import { expect } from "chai"
import { TsCompiler, CompileTransformers, CompileStatus } from "../../../src/TsCompiler"
import * as identity from "../../transforms/IdentityTransform"
import * as empty from "../../transforms/EmptyTransform"

describe( "compile()", () => {

    function compilesSuccessfully( name: string, fileName: string, options: ts.CompilerOptions, transformers?: CompileTransformers ) {
        describe( name, () => {
            let compileResult = TsCompiler.compile( [fileName], options, transformers );

            it( "completes with status is successful", () => {
                expect( compileResult.getStatus() ).to.equal( CompileStatus.Success );
            } );
        } );
    }

    function compilesWithErrors( name: string, fileName: string, options: ts.CompilerOptions, transformers?: CompileTransformers ) {
        describe( name, () => {
            let compileResult = TsCompiler.compile( [fileName], options, transformers );

            it( "completes with diagnostics", () => {
                expect( compileResult.getStatus() ).to.not.equal( CompileStatus.Success );
                expect( compileResult.getErrors() ).to.have.length.greaterThan( 0 );
            } );
        } );
    }

    compilesSuccessfully(
        "file exists with valid source",
        "./tests/projects/simple/main.ts",
        { module: ts.ModuleKind.CommonJS }
    );

    compilesWithErrors(
        "file does not exist",
        "anonexistentfile.ts",
        { module: ts.ModuleKind.CommonJS }
    );

    // Compile with transforms

    compilesSuccessfully(
        "file with valid source and identity transform",
        "./tests/projects/simple/main.ts",
        { module: ts.ModuleKind.CommonJS },
        () => ( {
            before: [
                identity.getTransform()
            ]
        } )
    );

    compilesSuccessfully(
        "file with valid source and empty transform",
        "./tests/projects/simple/main.ts",
        { module: ts.ModuleKind.CommonJS },
        () => ( {
            before: [empty.getTransform()]
        } )
    );
} );