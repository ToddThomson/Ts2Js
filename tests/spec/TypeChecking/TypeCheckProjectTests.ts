import { expect } from "chai"
import { TsCompiler, CompileOptions, CompileTransformers, CompileResult, CompileStatus } from "../../../src/TsCompiler"

describe( "Type checking", () => {

    function compileProject( name: string, projectConfigPath: string, compileOptions: CompileOptions, transformers?: CompileTransformers ) {
        describe( name, () => {
            let compileResult: CompileResult;

            compileResult = TsCompiler.compileProject(
                projectConfigPath,
                compileOptions,
                transformers );

            it( "Compile status is successful", () => {
                expect( compileResult.getStatus() ).to.equal( CompileStatus.Success );
                expect( compileResult.getErrors() ).to.have.length( 0 );
                var output = compileResult.getOutput();
                expect( output ).to.have.length( 0 );
            } );
        } );
    }

    compileProject(
        "project",
        "./tests/projects/simple",
        {
            verbose: true,
            typeCheckOnly: true
        }
    );
} );