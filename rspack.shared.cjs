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
    resolve: { extensions: [".ts", ".tsx", ".js", ".jsx"] },
    module: {
      rules: [{ test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ }],
    },
    plugins: [
      new ModuleFederationPlugin({ name, ...federation }),
      new rspack.HtmlRspackPlugin({ template: "./public/index.html" }),
    ],
  };
}

module.exports = { createConfig };
