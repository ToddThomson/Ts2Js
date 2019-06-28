import * as ts from "typescript"

export function getTransform(): ts.TransformerFactory<ts.SourceFile> {
    const identity = new IdentityTransform();
    return ( context: ts.TransformationContext ) => identity.transform( context );
}

export class IdentityTransform {
    private compilerOptions: ts.CompilerOptions;

    public transform( context: ts.TransformationContext ) {
        this.compilerOptions = context.getCompilerOptions();

        function transformSourceFile( sourceFile: ts.SourceFile ) {
            return sourceFile;
        }

        return transformSourceFile;
    }
}
