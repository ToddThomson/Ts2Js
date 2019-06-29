import * as ts from "typescript"
import { expect } from "chai"
import * as ts2js from "../../../lib/TsCompiler"

describe( "Transpile Module", () => {

    interface TranspileTestSettings {
        options?: ts.TranspileOptions;
    }

    function transpilesModule( name: string, input: string, settings: TranspileTestSettings ) {
        describe( name, () => {
            let moduleName: string;
            let transpileOptions: ts.TranspileOptions;
            let transpileResult: ts.TranspileOutput;

            transpileOptions = settings.options || {};

            moduleName = "TranspileModule/" + name.replace( /[^a-z0-9\-. ]/ig, "" ) + ( settings.options.compilerOptions.jsx ? ts.Extension.Tsx : ts.Extension.Ts );

            transpileResult = ts2js.TsCompiler.transpileModule( input, transpileOptions );

            it( "Transpile result has no diagnostics for " + moduleName, () => {
                expect( transpileResult.diagnostics.length ).to.equal( 0 );
            } );
        } );
    }

    transpilesModule( "Generates no diagnostics with valid inputs", `var x = 0;`,
        {
            options: { compilerOptions: { module: ts.ModuleKind.CommonJS } }
        } );
} );