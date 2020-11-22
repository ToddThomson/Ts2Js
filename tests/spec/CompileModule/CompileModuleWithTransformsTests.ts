import * as ts from "typescript"
import { expect } from "chai"
import * as identity from "../../transforms/IdentityTransform"
import * as empty from "../../transforms/EmptyTransform"
import { TsCompiler, CompileOptions, CompileTransformers, CompileStatus, CompileResult } from "../../../lib/TsCompiler"

describe( "Compile Module With Transforms", () => {

    function compilesModuleCorrectly( name: string, input: string, compilerOptions: ts.CompilerOptions, compileOptions?: CompileOptions, transformers?: CompileTransformers ) {
        describe( name, () => {
            let moduleName: string;
            let compileResult: CompileResult;
            compilerOptions = compilerOptions || {};
            //transformers = transformers || {}; 

            moduleName = "compileModule/" + name.replace( /[^a-z0-9\-. ]/ig, "" ) + ( compilerOptions.jsx ? ts.Extension.Tsx : ts.Extension.Ts );

            compileResult = TsCompiler.compileModule( input, moduleName, compilerOptions, compileOptions, transformers );

            it( "Correct errors for " + moduleName, () => {
                expect( compileResult.getStatus() ).to.equal( CompileStatus.Success );
            } );
        } );
    }

    compilesModuleCorrectly( "With Identity transform. Generates no diagnostics with valid inputs", `var x = 0;`,
        {
            module: ts.ModuleKind.CommonJS,
        },
        { verbose: true },
        () => ({
            before: [identity.getTransform()]
        } ) );

    compilesModuleCorrectly( "With Empty transform generates no diagnostics with valid inputs", `var x = 0;`,
        {
            module: ts.ModuleKind.CommonJS,
        },
        { verbose: true },
        () => ({
            before: [empty.getTransform()]
        } ) );
} );