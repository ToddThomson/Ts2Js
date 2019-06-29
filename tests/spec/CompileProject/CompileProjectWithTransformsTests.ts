﻿import * as ts from "typescript"
import { expect } from "chai"
import { TsCompiler, CompilerResult, CompileStatus } from "../../../lib/TsCompiler"
import * as identity from "../../transforms/IdentityTransform"
import * as empty from "../../transforms/EmptyTransform"

describe( "Compile Project With Transforms", () => {

    function compileProject( name: string, projectConfigPath: string, transformers?: ts.CustomTransformers ) {
        describe( name, () => {
            let compileResult: CompilerResult;

            compileResult = TsCompiler.compileProject( projectConfigPath, transformers );

            it( "Compile status is successful", () => {
                expect( compileResult.getStatus() ).to.equal( CompileStatus.Success );
            } );
        } );
    }

    compileProject(
        "With Identity transform",
        "./tests/projects/simple",
        {
            before: [identity.getTransform()]
        } );
} );