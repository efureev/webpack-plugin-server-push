# Server Push Webpack Plugin

This plugin creates configs for HTTP/2 Server Push for Nginx and other web-server.

## Install

```sh
yarn add -D nginx-push-webpack-plugin
# or 
npm install -D nginx-push-webpack-plugin
```


## Using

### Example #1: webpack.config.js

```js
// vue.config.js
const ServerPushWebpackPlugin = require('@feugene/webpack-plugin-server-push')

const vueConfig = {
    publicPath: '/',
    outputDir: 'dist',
    assetsDir: 'static',
    productionSourceMap: false,
    configureWebpack: {
        resolve: {
            alias: {
                '@': resolve('src'),
            },
        },
        plugins: [
            new ServerPushWebpackPlugin({
              target: 'nginx',
              omitLocation: true,
              filename: 'nginx.server-push.conf',
            })
        ],
    }
}

module.exports = vueConfig
```

This will generate a file dist/nginx.server-push.conf containing the following:
```conf
    http2_push /static/css/app.f908c0a3.css;
    http2_push /static/js/app.20460db2.js;
    http2_push /static/css/chunk-elementUI.5e0028e4.css;
    http2_push /static/js/chunk-elementUI.0911e193.js;
    http2_push /static/js/chunk-libs.06f73890.js;
```

Include the generated `nginx.server-push.conf` into your nginx config. For example:
```conf
server {
    server_name mockery.dev;

	listen 443 ssl http2;

	ssl_certificate /usr/share/cert/server/servercert.pem;
    ssl_certificate_key /usr/share/cert/server/serverkey.pem;
		
    location / {
		include nginx.server-push.conf;

        proxy_pass http://127.0.0.1:1115;
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
}

```

### Example #2: webpack.config.js

```js
// webpack.config.js
const ServerPushWebpackPlugin = require('@feugene/webpack-plugin-server-push')

module.exports = {
  entry: 'index.js',
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'index_bundle.js'
  },
  plugins: [
    new ServerPushWebpackPlugin({ target:'nginx', index: 'index.html' })
  ]
}
```

This will generate a file dist/nginx.push.conf containing the following:
```conf

location = / {
  http2_push /index_bundle.js;
}
```

Include the generated `nginx.push.conf` in main `nginx.conf` as below:
```conf
server {
    # listen on port 433 with https
    listen 443 ssl http2;

    server_name example.com;

    # ssl cert
    ssl_certificate /usr/share/cert/server/servercert.pem;
    ssl_certificate_key /usr/share/cert/server/serverkey.pem;

    # where the root here
    root /usr/share/app;

    # what file to server as index
    index index.html;

    # include nginx push conf to enable HTTP/2 server push
    include nginx.push.conf;
}
```
