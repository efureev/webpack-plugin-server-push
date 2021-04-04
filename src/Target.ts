export interface TargetOptions {
    /**
     * The file to write the nginx conf to.
     * Supports relative/absolute path eg: `conf/nginx.push.conf`, '/etc/conf/nginx/nginx.push.conf'
     * @default 'nginx.push.conf'
     */
    filename?: string;

    /**
     * Push static webpack bundle resource under what `location` in nginx
     * @default 'index.html'
     */
    index?: string;
}


export interface Target {
    filename: string
    index: string

    createConfig(assets: string[]): string
}

export abstract class AbstractTarget implements Target {
    readonly filename: string = 'push.conf';
    readonly index: string = 'index.html';

    protected constructor(options: TargetOptions) {
        if (options.filename) {
            this.filename = options.filename
        }

        if (options.index) {
            this.index = options.index
        }
    }

    abstract createConfig(assets: string[]): string
}
