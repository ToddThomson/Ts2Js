import * as ts from "typescript"
import { expect } from "chai"
import { TsCompiler, CompileOptions, CompileTransformers, CompileResult, CompileStatus } from "../../../src/TsCompiler"
import * as identity from "../../transforms/IdentityTransform"
import * as empty from "../../transforms/EmptyTransform"

describe( "Compile Project With Transforms", () => {

    function compileProject( name: string, projectConfigPath: string, compileOptions?: CompileOptions transformers?: CompileTransformers ) {
        describe( name, () => {
            let compileResult: CompileResult;

            compileResult = TsCompiler.compileProject( projectConfigPath, compileOptions, transformers );

            it( "Compile status is successful", () => {
                expect( compileResult.getStatus() ).to.equal( CompileStatus.Success );
            } );
        } );
    }

    compileProject(
        "With Identity transform",
        "./tests/projects/simple",
        { verbose: true },
        () => ( {
            before: [identity.getTransform()]
        } ) );
} );