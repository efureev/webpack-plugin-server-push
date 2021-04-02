import path from 'path'

const unique = (value) => value.filter((value, index, self) => self.indexOf(value) === index)

class ServerPushWebpackPlugin {
  constructor(options) {
    const { target } = options

    if (!target) {
      throw new Error('You should select target for ServerPushWebpackPlugin: `nginx`')
    }

    if (typeof target === 'string') {
      this.target = this.buildTarget(target, options)
    } else if (target instanceof Object) {
      this.target = target
    }
  }

  buildTarget(name, options) {
    if (name === 'nginx') {
      return new name(options)
    }
  }

  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    // convert absolute filename into relative so that webpack can
    // generate it at correct location
    const { filename } = this.options

    if (path.resolve(filename) === path.normalize(filename)) {
      this.options.filename = path.relative(compiler.options.output.path, filename)
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
          compilation.assets[this.options.filename] = {
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
  getAssets(compilation, chunks) {
    const compilationHash = compilation.hash

    // Use the configured public path or build a relative path
    let publicPath = typeof compilation.options.output.publicPath !== 'undefined'
      // If a hard coded public path exists use it
      ? compilation.mainTemplate.getPublicPath({ hash: compilationHash })
      // If no public path was set get a relative url path
      : path.relative(path.resolve(compilation.options.output.path, path.dirname(this.options.filename)), compilation.options.output.path)
        .split(path.sep).join('/')

    if (publicPath.length && publicPath.substr(-1, 1) !== '/') {
      publicPath += '/'
    }

    const assets = chunks.reduce((prev, chunk) => {
      const chunkFiles = [].concat(chunk.files).map((chunkFile) => publicPath + chunkFile)
      return prev.concat(chunkFiles)
    }, [])

    // Duplicate assets can occur on occasion if more than one chunk requires the same css.
    return unique(assets)
  }

  /**
   * Return all chunks from the compilation result which match the exclude and include filters
   */
  filterChunks(chunks) {
    return chunks.filter((chunk) => {
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
