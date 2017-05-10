import { TsCompiler } from "./src/TsCompiler";

var compileResult = TsCompiler.compileProject( "./src" );

console.log( "Compilation completed.");
console.log( "File: ", compileResult.emitOutput[0].fileName );
console.log( "File Output: \n", compileResult.emitOutput[0].codeFile.data );