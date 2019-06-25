import * as ts from "typescript";
import { CompilerOutput } from "./CompilerOutput";
import { CompileStatus } from "./CompileStatus";

export class CompilerResult {
    private status: CompileStatus;
    private readonly errors: ReadonlyArray<ts.Diagnostic>
    private readonly output: ReadonlyArray<CompilerOutput>

    constructor( status: CompileStatus, errors?: ReadonlyArray<ts.Diagnostic>, emitOutput?: CompilerOutput[], ) {
        this.status = status;
        this.errors = errors;
    }

    public getErrors(): ReadonlyArray<ts.Diagnostic> {
        return this.errors;
    }

    public getStatus(): CompileStatus {
        return this.status;
    }

    public getOutput(): ReadonlyArray<CompilerOutput> {
        return this.output;
    }

    public succeeded(): boolean {
        return ( this.status === CompileStatus.Success );
    }
}