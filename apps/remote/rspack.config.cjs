const { createConfig } = require("../../rspack.shared.cjs");

module.exports = createConfig({
  appDir: __dirname,
  name: "remote",
  port: 3001,
  federation: {
    filename: "remoteEntry.js",
    exposes: {
      "./Button": "./src/Button.ts",
    },
  },
  devServer: {
    headers: { "Access-Control-Allow-Origin": "*" },
  },
});
