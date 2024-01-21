const path = require("path");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

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
  plugins: [
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, ".."),
    }),
  ],
};
