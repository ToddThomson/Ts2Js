import * as ts from "typescript"

export function getTransform(): ts.TransformerFactory<ts.SourceFile> {
    const empty = new EmptyTransform();
    return ( context: ts.TransformationContext ) => empty.transform( context );
}

export class EmptyTransform{
    private compilerOptions: ts.CompilerOptions;

    public transform( context: ts.TransformationContext ) {
        this.compilerOptions = context.getCompilerOptions();

        function transformSourceFile( sourceFile: ts.SourceFile ) {
            return ts.updateSourceFileNode( sourceFile, [] );
        }

        return transformSourceFile;
    }
}
