export interface TargetOptions {
    filename?: string;
    index?: string;
}
export interface Target {
    filename: string;
    index: string;
    createConfig(assets: string[]): string;
}
export declare abstract class AbstractTarget implements Target {
    readonly filename: string;
    readonly index: string;
    protected constructor(options: TargetOptions);
    abstract createConfig(assets: string[]): string;
}
