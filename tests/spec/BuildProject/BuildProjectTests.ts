import { expect } from "chai"
import { TsSolutionBuilder, TsCompiler, CompileTransformers, CompileResult, CompileStatus } from "../../../src/TsCompiler"

describe( "Solution Builder", () => {

    function buildProject( name: string, projectConfigPath: string, transformers?: CompileTransformers ) {
        describe( name, () => {
            let compileResult: CompileResult;

            compileResult = TsSolutionBuilder.build( projectConfigPath, { verbose: true } );

            it( "Compile status is successful", () => {
                expect( compileResult.getStatus() ).to.equal( CompileStatus.Success );
                expect( compileResult.getErrors() ).to.have.length( 0 );
                var output = compileResult.getOutput();
                expect( output ).to.have.length.greaterThan( 0 );
            } );
        } );
    }

    buildProject( "Builds project", "./tests/projects/simple" );
} );