"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TsCompiler_1 = require("./src/TsCompiler");
var compileResult = TsCompiler_1.TsCompiler.compileProject("./src");
console.log("Compilation completed.");
console.log("File: ", compileResult.emitOutput[0].fileName);
console.log("File Output: \n", compileResult.emitOutput[0].codeFile.data);
//# sourceMappingURL=run.js.map