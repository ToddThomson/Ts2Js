import * as ts from "typescript";

export interface TransformPlugins {
    transforms: ts.CustomTransformers;
}