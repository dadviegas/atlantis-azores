const { createConfig } = require("../../rspack.shared.cjs");

module.exports = createConfig({
  appDir: __dirname,
  name: "host",
  port: 3000,
  federation: {
    remotes: {
      remote: "remote@http://localhost:3001/remoteEntry.js",
    },
  },
});
