const path = require("node:path");
const rspack = require("@rspack/core");
const { ModuleFederationPlugin } = require("@module-federation/enhanced/rspack");

function createConfig({ appDir, name, port, federation, devServer = {} }) {
  const publicPath = `http://localhost:${port}/`;
  const label = name.padEnd(7);

  return {
    entry: "./src/index.ts",
    mode: "development",
    devServer: {
      port,
      host: "localhost",
      hot: true,
      open: false,
      ...devServer,
      onListening(server) {
        const url = `http://localhost:${server.server.address().port}/`;
        console.log(`\n\x1b[36m▶ ${label} ready at\x1b[0m \x1b[1m${url}\x1b[0m`);
        if (federation.filename) {
          console.log(`\x1b[2m  ${federation.filename}: ${url}${federation.filename}\x1b[0m`);
        }
        console.log("");
      },
    },
    output: {
      publicPath,
      path: path.resolve(appDir, "dist"),
      uniqueName: name,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      alias: {
        "@emotion/server/create-instance": path.resolve(
          __dirname,
          "stubs/emotion-server-create-instance.js",
        ),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: { syntax: "typescript", tsx: true },
                transform: { react: { runtime: "automatic" } },
                target: "es2022",
              },
            },
          },
        },
        { test: /\.css$/, type: "css/auto" },
        { test: /\.md$/, type: "asset/source" },
      ],
    },
    experiments: { css: true },
    plugins: [
      new ModuleFederationPlugin({ name, shared: sharedDeps(), ...federation }),
      new rspack.HtmlRspackPlugin({ template: "./public/index.html" }),
    ],
  };
}

function sharedDeps() {
  return {
    react: { singleton: true, requiredVersion: "^18.3.1" },
    "react-dom": { singleton: true, requiredVersion: "^18.3.1" },
    "@atlantis/design-system": { singleton: true },
  };
}

module.exports = { createConfig };
