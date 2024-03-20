const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/bootstrap.ts",
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "script-LATEST.js",
    path: path.resolve(__dirname, "public"),
  },
};
