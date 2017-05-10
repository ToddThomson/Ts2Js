import * as ts from "typescript";
import { CompilerOutput } from "./CompilerOutput";

export interface CompilerResult {
    emitSkipped: boolean;
    emitOutput?: CompilerOutput[];
    diagnostics: ts.Diagnostic[];
}