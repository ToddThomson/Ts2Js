import * as ts from "typescript";
import { CompileFile } from "./CompileFile";

export interface CompileOutput {
    fileName: string;
    emitSkipped: boolean;
    diagnostics?: ReadonlyArray<ts.Diagnostic>;
    codeFile?: CompileFile;
    dtsFile?: CompileFile;
    mapFile?: CompileFile;
}