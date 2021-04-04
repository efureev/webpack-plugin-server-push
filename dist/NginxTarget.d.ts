import { AbstractTarget, TargetOptions } from "./Target";
export interface NginxOptions extends TargetOptions {
    omitLocation?: boolean;
}
declare class NginxTarget extends AbstractTarget {
    private readonly omitLocation;
    constructor(options: NginxOptions);
    createConfig(assets: string[]): string;
}
export default NginxTarget;
