export interface CompileOptions
{
    /**
     * Sets log level. Defaults to 0
     */
    logLevel?: number;

    /**
     * Sets verbose output. Defaults to false.
     */
    verbose?: boolean;

    /**
     * Sets type checking only with no output files emitted. Defaults to false.
     */
    typeCheckOnly?: boolean;
}