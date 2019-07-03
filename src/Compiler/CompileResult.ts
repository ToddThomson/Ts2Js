import * as ts from "typescript";
import { CompileOutput } from "./CompileOutput";
import { CompileStatus } from "./CompileStatus";

export class CompileResult {
    private status: CompileStatus;
    private readonly errors: ReadonlyArray<ts.Diagnostic>;
    private readonly output: ReadonlyArray<CompileOutput>;

    constructor( status: CompileStatus, errors?: ReadonlyArray<ts.Diagnostic>, emitOutput?: CompileOutput[] ) {
        this.status = status;
        this.errors = errors || [];
        this.output = emitOutput || [];
    }

    public getErrors(): ReadonlyArray<ts.Diagnostic> {
        return this.errors;
    }

    public getStatus(): CompileStatus {
        return this.status;
    }

    public getOutput(): ReadonlyArray<CompileOutput> {
        return this.output;
    }

    public succeeded(): boolean {
        return ( this.status === CompileStatus.Success );
    }
}