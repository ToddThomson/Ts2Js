import * as ts from "typescript"
import { expect } from "chai"
import { TsCompiler, CompilerResult, CompileStatus } from "../../lib/TsCompiler"

describe( "Compile Project", () => {

    function compileProject( name: string, projectConfigPath: string, transformers?: ts.CustomTransformers ) {
        describe( name, () => {
            let moduleName: string;
            let compileResult: CompilerResult;

            compileResult = TsCompiler.compileProject( projectConfigPath, transformers );

            it( "Correct errors for " + moduleName, () => {
                expect( compileResult.getStatus() ).to.equal( CompileStatus.Success );
            } );
        } );
    }

    compileProject( "Generates no diagnostics", "./../projects/simple",
        {
        } );
} );