import * as ts from "typescript";
import { CompilerOutput } from "./CompilerOutput";

export class CompilerResult {
    private status: ts.ExitStatus;
    private readonly errors: ReadonlyArray<ts.Diagnostic>
    private readonly output: ReadonlyArray<CompilerOutput>

    constructor( status: ts.ExitStatus, errors?: ReadonlyArray<ts.Diagnostic>, emitOutput?: CompilerOutput[], ) {
        this.status = status;
        this.errors = errors;
    }

    public getErrors(): ReadonlyArray<ts.Diagnostic> {
        return this.errors;
    }

    public getStatus(): ts.ExitStatus {
        return this.status;
    }

    public getOutput(): ReadonlyArray<CompilerOutput> {
        return this.output;
    }
    public succeeded(): boolean {
        return ( this.status === ts.ExitStatus.Success );
    }
}