import * as ts from "typescript"

/**
 * Custom type used to pass a {@link ts.Program } argument from the TsCompiler
 * to the custom transformers.
 */
export type CompileTransformers = ( ( program?: ts.Program ) => ts.CustomTransformers | undefined );