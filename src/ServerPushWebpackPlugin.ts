import path from 'path'
import {Compiler} from "webpack";
import {Target, TargetOptions} from "./Target";
import NginxTarget from "./NginxTarget";


const unique = (value: string[]) => value.filter((value, index, self) => self.indexOf(value) === index)

export interface ServerPushOptions {
    target: string | Target;
    options: TargetOptions;
}

class ServerPushWebpackPlugin {
    private readonly target: Target;

    constructor(options: ServerPushOptions) {
        const {target} = options

        if (typeof target === 'string') {

            this.target = this.buildTarget(target, options.options)
        } else {
            this.target = target
        }
    }

    buildTarget(name: any, options: TargetOptions): Target {
        if (name === 'nginx') {
            return new NginxTarget(options);
        }

        throw new Error(`Target ${name} does not ready.`)
    }


    // Define `apply` as its prototype method which is supplied with compiler as its argument
    apply(compiler: Compiler) {
        // convert absolute filename into relative so that webpack can
        // generate it at correct location
        // let filename = this.target.filename

        if (path.resolve(this.target.filename) === path.normalize(this.target.filename)) {
            this.target.filename = path.relative(`${compiler.options.output.path}`, this.target.filename)
        }

        // Specify the event hook to attach to
        compiler.hooks.emit.tapAsync('ServerPushWebpackPlugin', (compilation, callback) => {
            const allChunks = compilation.getStats().toJson().chunks

            // Filter out chunks without initialName
            const chunks = this.filterChunks(allChunks)

            // get all assets
            const assets = this.getAssets(compilation, chunks)

            Promise
                .resolve()
                .then(() => this.target.createConfig(assets))
                .then((conf) => {
                    // Replace the compilation result with the evaluated conf code
                    // @ts-ignore
                    compilation.assets[this.target.filename] = {
                        source: () => conf,
                        size: () => conf.length,
                    }
                })
                .catch((err) => {
                    console.error(err)
                    return null
                })
                .then(() => {
                    callback()
                })
        })
    }

    /**
     * get all assets
     */
    getAssets(compilation: any, chunks: any) {
        const compilationHash = compilation.hash

        // Use the configured public path or build a relative path
        let publicPath = typeof compilation.options.output.publicPath !== 'undefined'
            // If a hard coded public path exists use it
            ? compilation.mainTemplate.getPublicPath({hash: compilationHash})
            // If no public path was set get a relative url path
            : path.relative(path.resolve(compilation.options.output.path, path.dirname(this.target.filename)), compilation.options.output.path)
                .split(path.sep).join('/')

        if (publicPath.length && publicPath.substr(-1, 1) !== '/') {
            publicPath += '/'
        }

        const assets = chunks.reduce((prev: any, chunk: any) => {
            const chunkFiles = [].concat(chunk.files).map((chunkFile) => publicPath + chunkFile)
            return prev.concat(chunkFiles)
        }, [])

        // Duplicate assets can occur on occasion if more than one chunk requires the same css.
        return unique(assets)
    }

    /**
     * Return all chunks from the compilation result which match the exclude and include filters
     */
    filterChunks(chunks: any) {
        return chunks.filter((chunk: any) => {
            const chunkName = chunk.names[0]
            // This chunk doesn't have a name. This script can't handled it.
            if (chunkName === undefined) {
                return false
            }

            // Skip if the chunk should be lazy loaded
            if (typeof chunk.isInitial === 'function') {
                if (!chunk.isInitial()) {
                    return false
                }
            } else if (!chunk.initial) {
                return false
            }

            // Add otherwise
            return true
        })
    }
}

export default ServerPushWebpackPlugin
