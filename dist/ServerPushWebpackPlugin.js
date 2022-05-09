"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const NginxTarget_1 = __importDefault(require("./NginxTarget"));
const unique = (value) => value.filter((value, index, self) => self.indexOf(value) === index);
class ServerPushWebpackPlugin {
    target;
    constructor(options) {
        const { target } = options;
        if (typeof target === 'string') {
            this.target = this.buildTarget(target, options.options);
        }
        else {
            this.target = target;
        }
    }
    buildTarget(name, options) {
        if (name === 'nginx') {
            return new NginxTarget_1.default(options);
        }
        throw new Error(`Target ${name} does not ready.`);
    }
    apply(compiler) {
        if (path_1.default.resolve(this.target.filename) === path_1.default.normalize(this.target.filename)) {
            this.target.filename = path_1.default.relative(`${compiler.options.output.path}`, this.target.filename);
        }
        compiler.hooks.emit.tapAsync('ServerPushWebpackPlugin', (compilation, callback) => {
            const allChunks = compilation.getStats().toJson().chunks;
            const chunks = this.filterChunks(allChunks);
            const assets = this.getAssets(compilation, chunks);
            Promise
                .resolve()
                .then(() => this.target.createConfig(assets))
                .then((conf) => {
                compilation.assets[this.target.filename] = {
                    source: () => conf,
                    size: () => conf.length,
                };
            })
                .catch((err) => {
                console.error(err);
                return null;
            })
                .then(() => {
                callback();
            });
        });
    }
    getAssets(compilation, chunks) {
        const compilationHash = compilation.hash;
        let publicPath = typeof compilation.options.output.publicPath !== 'undefined'
            ? compilation.mainTemplate.getPublicPath({ hash: compilationHash })
            : path_1.default.relative(path_1.default.resolve(compilation.options.output.path, path_1.default.dirname(this.target.filename)), compilation.options.output.path)
                .split(path_1.default.sep).join('/');
        if (publicPath.length && publicPath.substr(-1, 1) !== '/') {
            publicPath += '/';
        }
        const assets = chunks.reduce((prev, chunk) => {
            const chunkFiles = []
                .concat(chunk.files).map((chunkFile) => publicPath + chunkFile)
                .concat(chunk.auxiliaryFiles).map((auxiliaryFile) => publicPath + auxiliaryFile);
            return prev.concat(chunkFiles);
        }, []);
        return unique(assets);
    }
    filterChunks(chunks) {
        return chunks.filter((chunk) => {
            const chunkName = chunk.names[0];
            if (chunkName === undefined) {
                return false;
            }
            if (typeof chunk.isInitial === 'function') {
                if (!chunk.isInitial()) {
                    return false;
                }
            }
            else if (!chunk.initial) {
                return false;
            }
            return true;
        });
    }
}
exports.default = ServerPushWebpackPlugin;
