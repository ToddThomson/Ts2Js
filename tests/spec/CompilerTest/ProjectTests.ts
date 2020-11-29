import { expect } from "chai"
import { Compiler, CompileOptions, CompileTransformers, CompileResult, CompileStatus } from "../../../src/TsCompiler"

describe( "Compiler API ", () => {

    function compileProject( name: string, projectConfigPath: string, compileOptions?: CompileOptions, transformers?: CompileTransformers ) {
        describe( name, () =>
        {
            const compiler = new Compiler();
            let compileResult: CompileResult = compiler.compileProject(
                projectConfigPath, compileOptions, transformers );

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
        } );
    }

    compileProject( "compileProject()", "./tests/projects/simple" );

    compileProject(
        "compileProject() with typeCheckOnly",
        "./tests/projects/simple",
        {
            verbose: true,
            typeCheckOnly: true,
        }
    );
} );