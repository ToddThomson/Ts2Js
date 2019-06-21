import * as ts from "typescript";
import { CompilerOutput } from "./CompilerOutput";

//export interface CompilerResult {
//    emitSkipped: boolean;
//    emitOutput?: CompilerOutput[];
//    diagnostics: ts.Diagnostic[];
//}

export class CompilerResult {

    private status: ts.ExitStatus;
    private readonly errors: ReadonlyArray<ts.Diagnostic>

    constructor( status: ts.ExitStatus, errors?: ReadonlyArray<ts.Diagnostic> ) {
        this.status = status;
        this.errors = errors;
    }

    public getErrors(): ReadonlyArray<ts.Diagnostic> {
        return this.errors;
    }

    public getStatus(): ts.ExitStatus {
        return this.status;
    }

    public succeeded(): boolean {
        return ( this.status === ts.ExitStatus.Success );
    }
}