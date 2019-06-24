import * as ts from "typescript";
import { CompilerFile } from "./CompilerFile";

export interface CompilerOutput {
    fileName: string;
    emitSkipped: boolean;
    diagnostics?: ReadonlyArray<ts.Diagnostic>;
    codeFile?: CompilerFile;
    dtsFile?: CompilerFile;
    mapFile?: CompilerFile;
}