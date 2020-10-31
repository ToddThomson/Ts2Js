export interface CompileOptions
{
    /** Defaults to 0 */
    logLevel?: number;

    /**
     * Sets verbose output.
     * Defaults to false.
     */
    verbose?: boolean;

    /**  Defaults to false. */
    outputToDisk?: boolean;

    incremental?: boolean;

    forceBuild?: boolean;
}