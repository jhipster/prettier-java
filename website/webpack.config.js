"use strict";

const webpack = require("webpack");

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
  target: "node",
  externals: {
    clipboard: "ClipboardJS",
    react: "React",
    "react-dom": "ReactDOM"
  },
  node: {
    global: true,
    crypto: "empty",
    process: true,
    module: false,
    clearImmediate: false,
    setImmediate: false
  }
};
