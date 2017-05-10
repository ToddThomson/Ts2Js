import * as ts from "typescript";
import { CompilerOutput } from "../Compiler/CompilerOutput";

export interface TransformContext {
    getHost(): ts.CompilerHost;
    getProgram(): ts.Program;

    onPostEmit?: ( emitResult: CompilerOutput ) => void;
}