import * as ts from "typescript";

export interface CompileOutput {
    fileName: string;
    data: string;
    // REVIEW: Do we want to have a DataType: Dts, Code, Map
}