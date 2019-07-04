import * as ts from "typescript"
import { expect } from "chai"
import { TsCompiler, CompileTransformers, CompileResult, CompileStatus } from  "../../../lib/TsCompiler"

describe( "Compile Module", () => {

    function compilesModuleCorrectly( name: string, input: string, options: ts.CompilerOptions, transformers?: CompileTransformers ) {
        describe( name, () => {
            let moduleName: string;
            let compileResult: CompileResult;
            options = options || {};

            moduleName = "compileModule/" + name.replace( /[^a-z0-9\-. ]/ig, "" ) + ( options.jsx ? ts.Extension.Tsx : ts.Extension.Ts );

            compileResult = TsCompiler.compileModule( input, moduleName, options );

            it( "Correct errors for " + moduleName, () => {
                expect( compileResult.getStatus() ).to.equal( CompileStatus.Success );
            } );
        } );
    }

    compilesModuleCorrectly( "Generates no diagnostics with valid inputs", `var x = 0;`,
        {
            module: ts.ModuleKind.CommonJS,
        } );
} );