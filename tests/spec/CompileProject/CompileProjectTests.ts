import * as ts from "typescript"
import { expect } from "chai"
import { TsCompiler, CompilerResult, CompileStatus } from "../../../lib/TsCompiler"

describe( "Compile Project", () => {

    function compileProject( name: string, projectConfigPath: string, transformers?: ts.CustomTransformers ) {
        describe( name, () => {
            let compileResult: CompilerResult;

            compileResult = TsCompiler.compileProject( projectConfigPath, transformers );

            it( "Compile status is successful", () => {
                expect( compileResult.getStatus() ).to.equal( CompileStatus.Success );
            } );
        } );
    }

    compileProject( "Compiles project", "./tests/projects/simple",
        {
        } );
} );