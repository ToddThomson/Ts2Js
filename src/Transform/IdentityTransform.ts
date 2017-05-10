import * as ts from "typescript";
import { TransformContext } from "./TransformContext";
import { TransformPlugin } from "./TransformPlugin";

export class IdentityTransform implements TransformPlugin {

    public transform( context: TransformContext ) {

        function transformImpl( sourceFile: ts.SourceFile) {
            return sourceFile;
        }

        return transformImpl;
    }
}