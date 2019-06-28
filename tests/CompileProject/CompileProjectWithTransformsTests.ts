import * as ts from "typescript"
import { expect } from "chai"
import * as identity from "../transforms/IdentityTransform"
import * as empty from "../transforms/EmptyTransform"
import * as ts2js from "../../lib/TsCompiler"

describe( "compileModule With Transforms", () => {

    function compilesModuleCorrectly( name: string, input: string, options: ts.CompilerOptions, transformers?: ts.CustomTransformers ) {
        describe( name, () => {
            let moduleName: string;
            let compileResult: ts2js.CompilerResult;
            options = options || {};

            moduleName = "compileModule/" + name.replace( /[^a-z0-9\-. ]/ig, "" ) + ( options.jsx ? ts.Extension.Tsx : ts.Extension.Ts );

            compileResult = ts2js.TsCompiler.compileModule( input, moduleName, options );

            it( "Correct errors for " + moduleName, () => {
                expect( compileResult.getStatus() ).to.equal( ts2js.CompileStatus.Success );
            } );
        } );
    }

    compilesModuleCorrectly( "With Identity transform. Generates no diagnostics with valid inputs", `var x = 0;`,
        {
            module: ts.ModuleKind.CommonJS,
        },
        {
            before: [identity.getTransform()]
        } );

    compilesModuleCorrectly( "With Empty transform generates no diagnostics with valid inputs", `var x = 0;`,
        {
            module: ts.ModuleKind.CommonJS,
        } );
} );