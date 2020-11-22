import * as ts from "typescript"
import { expect } from "chai"
import { TsCompiler, CompileOptions, CompileTransformers, CompileResult, CompileStatus } from  "../../../lib/TsCompiler"

describe( "Compile Module", () => {

    function compilesModuleCorrectly( name: string, input: string, compilerOptions: ts.CompilerOptions, compileOptions?: CompileOptions, transformers?: CompileTransformers ) {
        describe( name, () => {
            let moduleName: string;
            let compileResult: CompileResult;
            compilerOptions = compilerOptions || {};

            moduleName = "compileModule/" + name.replace( /[^a-z0-9\-. ]/ig, "" ) + ( compilerOptions.jsx ? ts.Extension.Tsx : ts.Extension.Ts );

            compileResult = TsCompiler.compileModule( input, moduleName, compilerOptions, compileOptions );

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