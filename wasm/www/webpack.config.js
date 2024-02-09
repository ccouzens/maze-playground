const path = require("path");

module.exports = {
  mode: "development",
  entry: "./bootstrap.js",
  experiments: {
    asyncWebAssembly: true,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
  },
  module: {
    rules: [
      {
        test: /\.wasm/,
        type: "asset/resource",
      },
    ],
  },
};
