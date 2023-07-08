"use strict";
const { createPrettierDoc } = require("./cst-printer");

// eslint-disable-next-line no-unused-vars
function genericPrint(path, options, print) {
  const node = path.getValue();
  return createPrettierDoc(node, options);
}

module.exports = genericPrint;
