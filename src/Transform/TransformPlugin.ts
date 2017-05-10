import * as ts from "typescript";
import { TransformContext } from "./TransformContext";

export type Transform = ( context: TransformContext ) => ( node: ts.SourceFile ) => ts.SourceFile;

export interface TransformPlugin {
    transform: Transform;
}
