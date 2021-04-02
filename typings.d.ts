import {Compiler, Plugin} from 'webpack';

export = ServerPushWebpackPlugin;

declare class ServerPushWebpackPlugin extends Plugin {
    constructor(options?: ServerPushWebpackPlugin.TargetOptions);

    target: ServerPushWebpackPlugin.Target

    apply(compiler: Compiler): void;
}

declare namespace ServerPushWebpackPlugin {
    interface Target {
        createConfig(assets: []): string
    }

    interface TargetOptions extends Partial<ProcessedTargetOptions> {
    }

    interface ProcessedTargetOptions {
        /**
         * The file to write the nginx conf to.
         * Supports relative/absolute path eg: `conf/nginx.push.conf`, '/etc/conf/nginx/nginx.push.conf'
         * @default 'nginx.push.conf'
         */
        filename: string;

        /**
         * Push static webpack bundle resource under what `location` in nginx
         * @default 'index.html'
         */
        index: string;
    }

    interface ProcessedNginxOptions extends ProcessedTargetOptions {

        /**
         * Don't generate nginx `location` directive
         * @default 'false'
         */
        omitLocation: string;
    }
}
