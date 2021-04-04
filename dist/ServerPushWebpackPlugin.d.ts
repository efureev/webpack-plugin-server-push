import { Compiler } from "webpack";
import { Target, TargetOptions } from "./Target";
export interface ServerPushOptions {
    target: string | Target;
    options: TargetOptions;
}
declare class ServerPushWebpackPlugin {
    private readonly target;
    constructor(options: ServerPushOptions);
    buildTarget(name: any, options: TargetOptions): Target;
    apply(compiler: Compiler): void;
    getAssets(compilation: any, chunks: any): string[];
    filterChunks(chunks: any): any;
}
export default ServerPushWebpackPlugin;
