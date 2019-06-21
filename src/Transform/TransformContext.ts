import * as ts from "typescript";
import { CompilerOutput } from "../Compiler/CompilerOutput";

export interface TransformContext extends ts.TransformationContext{
    getHost(): ts.CompilerHost;
    getProgram(): ts.Program;

    onPostEmit?: ( emitResult: CompilerOutput ) => void;
}