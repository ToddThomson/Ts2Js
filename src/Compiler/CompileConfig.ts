import * as ts from "typescript"

export interface CompileConfig
{
    fileNames: string[];
    options: ts.CompilerOptions;
    projectReferences?: readonly ts.ProjectReference[];
    errors: ts.Diagnostic[];
}