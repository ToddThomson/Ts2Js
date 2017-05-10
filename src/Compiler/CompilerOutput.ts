import * as ts from "typescript";
import { CompilerFile } from "./CompilerFile";

export interface CompilerOutput {
    fileName: string;
    emitSkipped: boolean;
    codeFile?: CompilerFile;
    dtsFile?: CompilerFile;
    mapFile?: CompilerFile;
    diagnostics: ts.Diagnostic[];
}