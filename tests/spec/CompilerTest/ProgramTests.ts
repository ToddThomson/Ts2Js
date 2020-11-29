import { expect } from "chai"
import { Compiler, CompileOptions, CompileTransformers, CompileResult, CompileStatus } from "../../../src/TsCompiler"

describe( "Compiler() getProgram() tests", () => {

    function compileProject( name: string, projectConfigPath: string, compileOptions?: CompileOptions, transformers?: CompileTransformers ) {
        describe( name, () =>
        {
            const compiler = new Compiler();

            const programBefore = compiler.getProgram();

            let compileResult: CompileResult = compiler.compileProject(
                projectConfigPath, compileOptions, transformers );

            const programAfter = compiler.getProgram();

            it( "getProgram() before compile is undefined", () =>
            {
                expect( programBefore ).to.equal( undefined );
            } );

            it( "Compile status is successful", () => {
                expect( compileResult.getStatus() ).to.equal( CompileStatus.Success );
                expect( compileResult.getErrors() ).to.have.length( 0 );
                var output = compileResult.getOutput();
                if ( compileOptions?.typeCheckOnly ) {
                    expect( output ).to.have.length( 0 );
                }
                else {
                    expect( output ).to.have.length.greaterThan( 0 );
                }
            } );

            it( "getProgram() after compile is defined", () =>
            {
                expect( programAfter ).to.not.equal( undefined );
            } );

        } );
    }

    compileProject(
        "CompileProject type checking only",
        "./tests/projects/simple",
        {
            verbose: true,
            typeCheckOnly: true,
        }
    );
} );