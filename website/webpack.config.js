"use strict";

const webpack = require("webpack");
const path = require("path");

function resolve(dir) {
  return path.join(__dirname, "..", dir);
}

module.exports = {
  entry: {
    playground: "./playground/index.jsx"
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/static/"
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/env", "@babel/react"]
        }
      }
    ]
  },
  externals: {
    clipboard: "ClipboardJS",
    react: "React",
    "react-dom": "ReactDOM"
  },
  resolve: {
    extensions: [".js"],
    alias: {
      prettier: "prettier/standalone"
    }
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: "empty",
    fs: "empty",
    net: "empty",
    tls: "empty",
    child_process: "empty"
  }
};
